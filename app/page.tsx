"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { BookOpen, Plus, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateContentFromDB } from "./actions";

// Book type definition
type Book = {
  id: string;
  title: string;
  genre: string;
  totalPages: number;
  currentPage: number;
  coverImage: string;
  character: Character;
  createdAt: number;
};

// Character type definition
type Character = {
  type: string;
  emoji: string;
  personality: string;
};

// Character templates based on genre
const characterTemplates: Record<string, Character> = {
  study: {
    type: "熱血系",
    emoji: "💪",
    personality: "passionate",
  },
  novel: {
    type: "ロマンチスト",
    emoji: "🌸",
    personality: "romantic",
  },
  philosophy: {
    type: "達観系",
    emoji: "🧘",
    personality: "zen",
  },
  magazine: {
    type: "フレンドリー",
    emoji: "😊",
    personality: "friendly",
  },
};

// Dialogue generator based on progress and personality
const getDialogue = (progress: number, personality: string): string => {
  const dialogues: Record<string, Record<string, string[]>> = {
    passionate: {
      start: ["さあ、始めよう！", "やる気満々だね！", "一緒に頑張ろう！"],
      middle: ["いい調子だ！", "あと少しで半分だ！", "その調子！"],
      almostDone: ["ラストスパート！", "もうすぐゴールだ！", "あと10ページ！"],
      complete: ["完読おめでとう！", "やったね！最高だ！", "素晴らしい！"],
    },
    romantic: {
      start: ["素敵な物語が待ってるよ", "ゆっくり楽しもうね", "一緒に読もう"],
      middle: ["このページ、詩的だね", "良い雰囲気だね", "心に響くね"],
      almostDone: ["もうすぐ終わりだね", "名残惜しいな", "クライマックスだ"],
      complete: ["素晴らしい旅だったね", "感動的だった", "心に残るね"],
    },
    zen: {
      start: ["焦らずゆっくりと", "静かに始めよう", "心を落ち着けて"],
      middle: ["読むほどに深まるね", "理解が深まってる", "良い感じだ"],
      almostDone: ["終わりが見えてきた", "もうすぐだね", "最後まで丁寧に"],
      complete: ["完読、お疲れ様", "深い学びだったね", "素晴らしい"],
    },
    friendly: {
      start: ["今日も読もう！", "気軽にいこう！", "よろしくね！"],
      middle: ["楽しんでる？", "いい感じだね！", "順調だね！"],
      almostDone: ["もうちょっとだよ！", "ゴール間近！", "あと少し！"],
      complete: ["完読だ！やったね！", "お疲れ様！", "最高だよ！"],
    },
  };

  const messages = dialogues[personality];
  if (progress === 0)
    return messages.start[Math.floor(Math.random() * messages.start.length)];
  if (progress === 100)
    return messages.complete[
      Math.floor(Math.random() * messages.complete.length)
    ];
  if (progress >= 80)
    return messages.almostDone[
      Math.floor(Math.random() * messages.almostDone.length)
    ];
  return messages.middle[Math.floor(Math.random() * messages.middle.length)];
};

export default function TsundokuTama() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentView, setCurrentView] = useState<"home" | "detail">("home");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Load books from localStorage on mount
  useEffect(() => {
    const savedBooks = localStorage.getItem("tsundoku-books");
    if (savedBooks) {
      setBooks(JSON.parse(savedBooks));
    } else {
      // Add sample books for demo
      const sampleBooks: Book[] = [
        {
          id: "1",
          title: "React完全ガイド",
          genre: "study",
          totalPages: 350,
          currentPage: 120,
          coverImage: "/react-programming-book-cover.jpg",
          character: characterTemplates.study,
          createdAt: Date.now(),
        },
        {
          id: "2",
          title: "夏目漱石「こころ」",
          genre: "novel",
          totalPages: 280,
          currentPage: 50,
          coverImage: "/japanese-literature-book-cover.jpg",
          character: characterTemplates.novel,
          createdAt: Date.now(),
        },
      ];
      setBooks(sampleBooks);
      localStorage.setItem("tsundoku-books", JSON.stringify(sampleBooks));
    }
  }, []);

  // Save books to localStorage whenever they change
  useEffect(() => {
    if (books.length > 0) {
      localStorage.setItem("tsundoku-books", JSON.stringify(books));
    }
  }, [books]);

  // Add new book
  const addBook = (
    title: string,
    genre: string,
    totalPages: number,
    coverImage: string
  ) => {
    const newBook: Book = {
      id: Date.now().toString(),
      title,
      genre,
      totalPages,
      currentPage: 0,
      coverImage,
      character:
        characterTemplates[genre as keyof typeof characterTemplates] ||
        characterTemplates.magazine,
      createdAt: Date.now(),
    };
    setBooks([...books, newBook]);
    setIsAddDialogOpen(false);
  };

  // Update book progress
  const updateProgress = (bookId: string, newPage: number) => {
    setBooks(
      books.map((book) =>
        book.id === bookId ? { ...book, currentPage: newPage } : book
      )
    );
    if (selectedBook?.id === bookId) {
      setSelectedBook({ ...selectedBook, currentPage: newPage });
    }
  };

  // Delete book
  const deleteBook = (bookId: string) => {
    setBooks(books.filter((book) => book.id !== bookId));
    if (selectedBook?.id === bookId) {
      setSelectedBook(null);
      setCurrentView("home");
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">積読タマ</h1>
          </div>
          {currentView === "detail" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCurrentView("home");
                setSelectedBook(null);
              }}
            >
              戻る
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {currentView === "home" ? (
          <HomeView
            books={books}
            onSelectBook={(book) => {
              setSelectedBook(book);
              setCurrentView("detail");
            }}
            onDeleteBook={deleteBook}
          />
        ) : (
          selectedBook && (
            <DetailView
              book={selectedBook}
              onUpdateProgress={updateProgress}
              onDelete={() => deleteBook(selectedBook.id)}
            />
          )
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-around py-3">
          <Button
            variant={currentView === "home" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("home")}
            className="flex flex-col items-center gap-1"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">本棚</span>
          </Button>

          <AddBookDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onAddBook={addBook}
          />

          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">設定</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}

// Home View Component - Book shelf grid
function HomeView({
  books,
  onSelectBook,
  onDeleteBook,
}: {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
}) {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-xl font-bold mb-2">本棚が空です</h2>
        <p className="text-muted-foreground mb-6">
          下の＋ボタンから本を追加しましょう！
        </p>

        {/* テスト用ボタン */}
        <TestGeminiButton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-foreground">あなたの本棚</h2>
        <TestGeminiButton />
      </div>
      <div className="grid grid-cols-1 gap-4">
        {books.map((book) => {
          const progress = Math.round(
            (book.currentPage / book.totalPages) * 100
          );
          return (
            <Card
              key={book.id}
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onSelectBook(book)}
            >
              <div className="flex gap-4">
                {/* Book Cover */}
                <div className="flex-shrink-0">
                  <img
                    src={book.coverImage || "/placeholder.svg"}
                    alt={book.title}
                    className="w-20 h-28 object-cover rounded-lg shadow-md"
                  />
                </div>

                {/* Book Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground truncate mb-1">
                    {book.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{book.character.emoji}</span>
                    <span className="text-xs text-muted-foreground">
                      {book.character.type}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 mb-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {book.currentPage} / {book.totalPages}ページ
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Character Dialogue */}
                  <div className="bg-accent rounded-2xl px-3 py-2 text-sm text-accent-foreground">
                    {getDialogue(progress, book.character.personality)}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Detail View Component - Individual book with character
function DetailView({
  book,
  onUpdateProgress,
  onDelete,
}: {
  book: Book;
  onUpdateProgress: (bookId: string, newPage: number) => void;
  onDelete: () => void;
}) {
  const progress = Math.round((book.currentPage / book.totalPages) * 100);
  const [localPage, setLocalPage] = useState(book.currentPage);

  useEffect(() => {
    setLocalPage(book.currentPage);
  }, [book.currentPage]);

  const handleProgressChange = (value: number[]) => {
    setLocalPage(value[0]);
  };

  const handleProgressCommit = (value: number[]) => {
    onUpdateProgress(book.id, value[0]);
  };

  return (
    <div className="space-y-6">
      {/* Book Cover & Character */}
      <Card className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <img
            src={book.coverImage || "/placeholder.svg"}
            alt={book.title}
            className="w-40 h-56 object-cover rounded-xl shadow-lg"
          />
          <h2 className="text-xl font-bold text-foreground">{book.title}</h2>

          {/* Character Display */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-6xl">{book.character.emoji}</div>
            <div className="text-sm text-muted-foreground">
              {book.character.type}
            </div>
          </div>

          {/* Character Speech Bubble */}
          <div className="bg-primary/20 rounded-3xl px-6 py-4 max-w-xs relative">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary/20 rotate-45" />
            <p className="text-foreground font-medium">
              {getDialogue(progress, book.character.personality)}
            </p>
          </div>
        </div>
      </Card>

      {/* Progress Control */}
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-base font-bold">読書進捗</Label>
            <span className="text-2xl font-bold text-primary">{progress}%</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {localPage} / {book.totalPages} ページ
          </div>
        </div>

        <Slider
          value={[localPage]}
          onValueChange={handleProgressChange}
          onValueCommit={handleProgressCommit}
          max={book.totalPages}
          step={1}
          className="py-4"
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => {
              const newPage = Math.max(0, localPage - 10);
              setLocalPage(newPage);
              onUpdateProgress(book.id, newPage);
            }}
          >
            -10ページ
          </Button>
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => {
              const newPage = Math.min(book.totalPages, localPage + 10);
              setLocalPage(newPage);
              onUpdateProgress(book.id, newPage);
            }}
          >
            +10ページ
          </Button>
        </div>

        {progress === 100 && (
          <div className="bg-primary/10 rounded-xl p-4 text-center space-y-2">
            <div className="text-4xl">🎉</div>
            <p className="font-bold text-primary">完読おめでとう！</p>
          </div>
        )}
      </Card>

      {/* Delete Button */}
      <Button variant="destructive" className="w-full" onClick={onDelete}>
        <Trash2 className="w-4 h-4 mr-2" />
        この本を削除
      </Button>
    </div>
  );
}

// Add Book Dialog Component
function AddBookDialog({
  isOpen,
  onOpenChange,
  onAddBook,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBook: (
    title: string,
    genre: string,
    totalPages: number,
    coverImage: string
  ) => void;
}) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("study");
  const [totalPages, setTotalPages] = useState("300");
  const [coverImage, setCoverImage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !totalPages) return;

    const imageUrl =
      coverImage ||
      `/placeholder.svg?height=200&width=150&query=${encodeURIComponent(
        title + " book cover"
      )}`;
    onAddBook(title, genre, Number.parseInt(totalPages), imageUrl);

    // Reset form
    setTitle("");
    setGenre("study");
    setTotalPages("300");
    setCoverImage("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="flex flex-col items-center gap-1 bg-primary hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs">追加</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>新しい本を追加</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">本のタイトル</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：React完全ガイド"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">ジャンル</Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger id="genre">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="study">勉強・技術書 💪</SelectItem>
                <SelectItem value="novel">小説・文学 🌸</SelectItem>
                <SelectItem value="philosophy">哲学・思想 🧘</SelectItem>
                <SelectItem value="magazine">雑誌・趣味 😊</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pages">総ページ数</Label>
            <Input
              id="pages"
              type="number"
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value)}
              placeholder="300"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">表紙画像URL（任意）</Label>
            <Input
              id="cover"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">
              空欄の場合は自動生成されます
            </p>
          </div>

          <Button type="submit" className="w-full">
            本を追加
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Test Gemini Button Component
function TestGeminiButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await generateContentFromDB();
      if (response.success) {
        setResult(response.message);
      } else {
        setResult(`エラー: ${response.message}`);
      }
    } catch (error) {
      setResult(
        `エラー: ${error instanceof Error ? error.message : "不明なエラー"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleTest}
        disabled={isLoading}
        variant="outline"
        size="sm"
      >
        {isLoading ? "生成中..." : "🤖 Gemini テスト"}
      </Button>

      {result && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h3 className="font-bold mb-2">生成されたテキスト:</h3>
          <div className="text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
