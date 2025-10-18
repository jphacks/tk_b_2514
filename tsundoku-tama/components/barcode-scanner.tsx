"use client";

import React, { useRef, useEffect, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, X, Loader2 } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const initScanner = async () => {
      try {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        // デバッグ情報を有効化
        reader.timeBetweenDecodingAttempts = 100;

        // 利用可能なカメラデバイスを取得
        const videoInputDevices = await reader.listVideoInputDevices();

        if (videoInputDevices.length === 0) {
          setError("カメラが見つかりません");
          return;
        }

        // バックカメラを優先的に選択
        const backCamera = videoInputDevices.find(
          (device) =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("rear")
        );

        const selectedDevice = backCamera || videoInputDevices[0];

        setIsScanning(true);
        setError(null);

        // バーコードスキャンを開始
        await reader.decodeFromVideoDevice(
          selectedDevice.deviceId,
          videoRef.current!,
          (result, error) => {
            if (result) {
              const scannedText = result.getText();
              setDebugInfo(`スキャン結果: ${scannedText}`);
              console.log("Scanned text:", scannedText);

              // ISBNの形式をチェック（より柔軟に）
              const cleanText = scannedText.replace(/[^0-9]/g, "");
              if (cleanText.length === 10 || cleanText.length === 13) {
                console.log("Valid ISBN found:", cleanText);
                onScan(cleanText);
                stopScanning();
              } else {
                setDebugInfo(
                  `無効な形式: ${scannedText} (長さ: ${cleanText.length})`
                );
              }
            }
            if (error && !error.message.includes("No MultiFormat Readers")) {
              console.log("Scan error:", error);
              setDebugInfo(`スキャンエラー: ${error.message}`);
            }
          }
        );
      } catch (err) {
        console.error("Scanner initialization error:", err);
        setError("カメラの初期化に失敗しました");
        setIsScanning(false);
      }
    };

    initScanner();

    return () => {
      stopScanning();
    };
  }, [onScan]);

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-background">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold">バーコードをスキャン</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 rounded-lg p-4 flex items-center gap-2 text-white">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">スキャン中...</span>
                </div>
              </div>
            )}
            {/* スキャン範囲のガイド */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-32 border-2 border-white border-dashed rounded-lg opacity-50"></div>
            </div>
          </div>

          {error && (
            <div className="text-center text-destructive text-sm">{error}</div>
          )}

          {debugInfo && showDebug && (
            <div className="text-center text-xs text-muted-foreground bg-muted p-2 rounded">
              {debugInfo}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="w-full text-xs"
          >
            {showDebug ? "デバッグ情報を隠す" : "デバッグ情報を表示"}
          </Button>

          <div className="text-center text-sm text-muted-foreground space-y-2">
            <div className="flex items-center justify-center gap-1">
              <Camera className="h-4 w-4" />
              本のバーコードをカメラに向けてください
            </div>
            <div className="text-xs">
              • バーコードを枠内に合わせてください
              <br />
              • 明るい場所でスキャンしてください
              <br />• バーコードがはっきり見えるようにしてください
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              キャンセル
            </Button>
            {!isScanning && (
              <Button
                onClick={() => {
                  setError(null);
                  // スキャンを再開
                  const initScanner = async () => {
                    try {
                      const reader = new BrowserMultiFormatReader();
                      readerRef.current = reader;
                      reader.timeBetweenDecodingAttempts = 100;
                      const videoInputDevices =
                        await reader.listVideoInputDevices();
                      const selectedDevice = videoInputDevices[0];
                      setIsScanning(true);
                      await reader.decodeFromVideoDevice(
                        selectedDevice.deviceId,
                        videoRef.current!,
                        (result, error) => {
                          if (result) {
                            const scannedText = result.getText();
                            setDebugInfo(`スキャン結果: ${scannedText}`);
                            console.log("Scanned text:", scannedText);

                            const cleanText = scannedText.replace(
                              /[^0-9]/g,
                              ""
                            );
                            if (
                              cleanText.length === 10 ||
                              cleanText.length === 13
                            ) {
                              console.log("Valid ISBN found:", cleanText);
                              onScan(cleanText);
                              stopScanning();
                            } else {
                              setDebugInfo(
                                `無効な形式: ${scannedText} (長さ: ${cleanText.length})`
                              );
                            }
                          }
                          if (
                            error &&
                            !error.message.includes("No MultiFormat Readers")
                          ) {
                            setDebugInfo(`スキャンエラー: ${error.message}`);
                          }
                        }
                      );
                    } catch (err) {
                      setError("カメラの初期化に失敗しました");
                    }
                  };
                  initScanner();
                }}
                className="flex-1"
              >
                再試行
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
