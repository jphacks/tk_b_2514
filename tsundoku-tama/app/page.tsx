"use client";
import { useState, useEffect } from "react";
import { BookOpen, Plus, Settings, Trash2, Camera, House, Library } from "lucide-react";
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

const BarcodeScanner = ({ onScan, onClose }: any) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <p>バーコードスキャナー（ダミー）</p>
      <Input placeholder="ISBNを入力 (例: 97847981)" onChange={(e) => onScan(e.target.value)} />
      <Button onClick={onClose} className="mt-4">閉じる</Button>
    </div>
  </div>
);

const fetchBookInfo = async (isbn: string) => {
  console.log(`Searching for book with ISBN: ${isbn}`);
  // ダミーのデータ
  if (isbn.startsWith("9784")) {
    return {
      title: `スキャンされた本 ${isbn}`,
      author: "著者名",
      publisher: "出版社",
      coverImage: "/react-programming-book-cover.jpg", // ダミー画像
      isbn: isbn,
    };
  }
  return null;
};

// AddBookView コンポーネント
function AddBookView({
  onAddBook,
  onOpenScanner,
  scannedBookInfo,
  onGoHome,
}: {
  onAddBook: (
    title: string,
    genre: string,
    totalPages: number,
    coverImage: string
  ) => void;
  onOpenScanner: () => void;
  scannedBookInfo: {
    title: string;
    author: string;
    publisher: string;
    coverImage: string;
    isbn: string;
  } | null;
  onGoHome: () => void;
}) {
  const [title, setTitle] = useState(scannedBookInfo?.title || "");
  const [genre, setGenre] = useState("study");
  const [totalPages, setTotalPages] = useState("300");
  const [coverImage, setCoverImage] = useState(scannedBookInfo?.coverImage || "");

  // scannedBookInfoが更新されたらフォームに自動入力
  useEffect(() => {
    if (scannedBookInfo) {
      setTitle(scannedBookInfo.title);
      setCoverImage(scannedBookInfo.coverImage);
      // その他の情報も設定可能
    }
  }, [scannedBookInfo]);

  const resetForm = () => {
    setTitle("");
    setGenre("study");
    setTotalPages("300");
    setCoverImage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !totalPages) return;

    const imageUrl =
      coverImage ||
      `/placeholder.svg?height=200&width=150&query=${encodeURIComponent(
        title + " book cover"
      )}`;

    onAddBook(title, genre, Number.parseInt(totalPages), imageUrl);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* ヘッダーとキャンセルボタン */}
      <div className="flex justify-between items-center pb-2 border-b">
        <h2 className="text-xl font-bold">新しい本を追加</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onGoHome}
        >
          キャンセル
        </Button>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Barcode Scanner Button */}
          <div className="space-y-2">
            <Label>本の追加方法</Label>
            <Button
              type="button"
              variant="outline"
              onClick={onOpenScanner}
              className="w-full flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              バーコードをスキャン
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              または下記のフォームに手動入力
            </p>
          </div>

          {/* スキャンされた情報の表示 */}
          {scannedBookInfo && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
              <h3 className="font-semibold text-green-800">スキャン情報</h3>
              <p className="text-sm">
                <span className="font-medium">タイトル:</span> {scannedBookInfo.title}
              </p>
              <p className="text-sm">
                <span className="font-medium">著者:</span> {scannedBookInfo.author}
              </p>
              <p className="text-sm">
                <span className="font-medium">出版社:</span> {scannedBookInfo.publisher}
              </p>
            </div>
          )}

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
            <div className="space-y-2">
              <Input
                id="pages"
                type="number"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                placeholder="300"
                required
              />
              <div className="flex gap-2 flex-wrap">
                <Button type="button" variant="outline" size="sm" onClick={() => setTotalPages("100")} className="text-xs">100ページ</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setTotalPages("200")} className="text-xs">200ページ</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setTotalPages("300")} className="text-xs">300ページ</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setTotalPages("400")} className="text-xs">400ページ</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setTotalPages("500")} className="text-xs">500ページ</Button>
              </div>
            </div>
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
      </Card>
    </div>
  );
}

// LibraryView コンポーネント
function LibraryView({
  books,
  onSelectBook,
}: {
  books: Book[];
  onSelectBook: (book: Book) => void;
}) {
  // ジャンル選択状態を管理
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  // 完読本のみ抽出
  const completedBooks = books.filter((book) => book.currentPage === book.totalPages);

  // ジャンルごとに本をグループ化
  const booksByGenre = completedBooks.reduce((acc, book) => {
    if (!acc[book.genre]) acc[book.genre] = [];
    acc[book.genre].push(book);
    return acc;
  }, {} as Record<string, Book[]>);

  // ジャンルの並び順を定義
  const genreOrder = ["study", "novel", "philosophy", "magazine"];
  const sortedGenres = [...new Set([...genreOrder, ...Object.keys(booksByGenre)])].filter(
    (genre) => booksByGenre[genre] && booksByGenre[genre].length > 0
  );

  // フィルタリング処理
  const filteredGenres =
    selectedGenre === "all" ? sortedGenres : sortedGenres.filter((g) => g === selectedGenre);

  // 完読本がない場合
  if (completedBooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">📖</div>
        <h2 className="text-xl font-bold mb-2">まだ完読した本はありません</h2>
        <p className="text-muted-foreground mb-6">
          読書を頑張って、本棚をいっぱいにしましょう！
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F5E6] min-h-screen p-4 space-y-10 overflow-y-auto">
      <h2 className="text-lg font-bold text-foreground mb-2">完読本棚</h2>

      {/* ジャンル切り替えボタン */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={selectedGenre === "all" ? "default" : "outline"}
          onClick={() => setSelectedGenre("all")}
          className="text-sm"
        >
          全て
        </Button>
        {sortedGenres.map((genre) => (
          <Button
            key={genre}
            variant={selectedGenre === genre ? "default" : "outline"}
            onClick={() => setSelectedGenre(genre)}
            className="text-sm"
          >
            {genre === "study" && "勉強・技術書 💪"}
            {genre === "novel" && "小説・文学 🌸"}
            {genre === "philosophy" && "哲学・思想 🧘"}
            {genre === "magazine" && "雑誌・趣味 😊"}
          </Button>
        ))}
      </div>

      {filteredGenres.map((genre) => (
        <div key={genre} className="mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4 capitalize">
            {genre === "study" && "勉強・技術書"}
            {genre === "novel" && "小説・文学"}
            {genre === "philosophy" && "哲学・思想"}
            {genre === "magazine" && "雑誌・趣味"}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {booksByGenre[genre]?.map((book) => (
              <Card
                key={book.id}
                className="p-3 cursor-pointer hover:shadow-lg transition-shadow flex flex-col items-center text-center"
                onClick={() => onSelectBook(book)}
              >
                <img
                  src={book.coverImage || "/placeholder.svg"}
                  alt={book.title}
                  className="w-24 h-36 object-cover rounded-md shadow-sm mb-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
                <p className="text-sm font-medium text-foreground truncate w-full">
                  {book.title}
                </p>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// TsundokuTama コンポーネントの定義
export default function TsundokuTama() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentView, setCurrentView] = useState<"home" | "detail" | "add" | "library">("home");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedBookInfo, setScannedBookInfo] = useState<{
    title: string;
    author: string;
    publisher: string;
    coverImage: string;
    isbn: string;
  } | null>(null);

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

  // Handle barcode scan
  const handleBarcodeScan = async (isbn: string) => {
    setIsScannerOpen(false);

    try {
      const bookInfo = await fetchBookInfo(isbn);
      if (bookInfo) {
        setScannedBookInfo(bookInfo);
        setCurrentView("add"); // スキャン成功後、Addビューに切り替える
      } else {
        alert("本の情報が見つかりませんでした。手動で入力してください。");
        setScannedBookInfo(null); // 情報が見つからなかった場合はリセット
        setCurrentView("add"); // 手動入力のためにAddビューに切り替える
      }
    } catch (error) {
      console.error("Error fetching book info:", error);
      alert("本の情報の取得に失敗しました。手動で入力してください。");
      setScannedBookInfo(null); // エラー時もリセット
      setCurrentView("add"); // 手動入力のためにAddビューに切り替える
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 border-b bg-white border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">りーどみー</h1>
          </div>
          {(currentView === "detail" || currentView === "library") && (
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
            books={books.filter(book => book.currentPage<book.totalPages)}
            onSelectBook={(book: Book) => {
              setSelectedBook(book);
              setCurrentView("detail");
            }}
            onDeleteBook={deleteBook}
          />
        ) : currentView === "detail" ? (
          selectedBook && (
            <DetailView
              book={selectedBook}
              onUpdateProgress={updateProgress}
               onDelete={() => { // onDelete のロジックを修正
                if (selectedBook) {
                  deleteBook(selectedBook.id);
                }
              }}
              onGoHome={() => {
                setCurrentView("home");
                setSelectedBook(null);
              }}
            />
          )
        ) : currentView === "add" ? (
          <AddBookView
            onAddBook={(title, genre, totalPages, coverImage) => {
              addBook(title, genre, totalPages, coverImage);
              setCurrentView("home"); // 登録後、ホームに戻る
              setScannedBookInfo(null); // スキャン情報をリセット
            }}
            onOpenScanner={() => setIsScannerOpen(true)}
            scannedBookInfo={scannedBookInfo}
            onGoHome={() => {
              setCurrentView("home");
              setScannedBookInfo(null);
            }}
          />
         ) : currentView === "library" ? (
          <LibraryView
            books={books}
            onSelectBook={(book: Book) => {
              setSelectedBook(book);
              setCurrentView("detail");
            }}
          />
        ) : null}
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
            <House className="w-5 h-5" />
            <span className="text-xs">ホーム</span>
          </Button>
          <Button
          variant={currentView === "add" ? "default" : "ghost"}
          size="sm"
          // className から bg-primary と hover:bg-primary/90 を削除
          className="flex flex-col items-center gap-1"
          onClick={() => {
          setCurrentView("add");
          setScannedBookInfo(null);
          }}
          >
          <Plus className="w-5 h-5" />
          <span className="text-xs">追加</span>
          </Button>

          <Button
            variant={currentView === "library" ? "default" : "ghost"}
            size="sm"
            className="flex flex-col items-center gap-1"
            onClick={() => setCurrentView("library")}
          >
            <Library className="w-5 h-5" />
            <span className="text-xs">本棚</span>
          </Button>
        </div>
      </nav>

      {/* Barcode Scanner (isScannerOpen が true のときにのみ表示) */}
      {isScannerOpen && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
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
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">あなたの本棚</h2>
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
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg"; // Fallback image
                    }}
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
                    <div className="h-2 bg-muted rounded-full overflow-hidden"> {/* 進捗バーの背景 */}
                      <div className={`h-full ${
                          progress < 30
                            ? "bg-red-500" // 0-29%
                            : progress < 70
                            ? "bg-yellow-500" // 30-69%
                            : progress < 100
                            ? "bg-blue-500" // 70-99%
                            : "bg-green-500" // 100%
                        } transition-all duration-300`}
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
  onGoHome,
}: {
  book: Book;
  onUpdateProgress: (bookId: string, newPage: number) => void;
  onDelete: () => void;
  onGoHome: () => void;
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
  }

// 📘 新しく追加する関数: 進捗を確定し、ホーム画面に戻る
  const handleRecordAndGoHome = () => {
    // 1. 進捗の確定（Sliderの操作に関係なく、現在のローカルなページ数を確定する）
    onUpdateProgress(book.id, localPage);

    // 2. ホーム画面へ戻る
    onGoHome();
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
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg"; // Fallback image
            }}
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

      {/* 記録してホームに戻るボタン (新しいボタン) */}
      <Button
        variant="default" // メインのアクションとして強調する
        className="w-full"
        onClick={handleRecordAndGoHome} // 👆 新しく定義した関数を呼び出す
      >
        <House className="w-4 h-4 mr-2" />
        進捗を記録
      </Button>
  
      {/* Progress Control */}
      <Card className="px-6 py-2 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-base font-bold text-2xl">読書進捗</Label>
            <span className="text-2xl font-bold text-primary text-2xl">{progress}%</span>
          </div>
          <div className="text-sm text-muted-foreground text-xl">
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
          // progress={progress} // ここに進捗度を渡す！ -> Sliderには直接このプロップは存在しないため削除
        />

        <div className="flex flex-wrap gap-1 w-full justify-between items-center"> {/* ボタン間の隙間をさらに狭く gap-1 に変更 */}
          
          {/* 1. -10P */}
          <Button
            variant="outline"
            // flex-1, 文字サイズは維持し、パディングを最小化 (px-1, py-0.5)
            className="bg-transparent text-[15px] px-1 py-0.5 w-[32%] min-w-0" 
            onClick={() => {
              const newPage = Math.max(0, localPage - 10);
              setLocalPage(newPage);
              onUpdateProgress(book.id, newPage);
            }}
          >
            -10P
          </Button>

          {/* 2. -5P */}
          <Button
            variant="outline"
            className="bg-transparent text-[15px] px-1 py-0.5 w-[32%] min-w-0"
            onClick={() => {
              const newPage = Math.max(0, localPage - 5);
              setLocalPage(newPage);
              onUpdateProgress(book.id, newPage);
            }}
          >
            -5P
          </Button>
          
          {/* 3. -2P */}
          <Button
            variant="outline"
            className="bg-transparent text-[15px] px-1 py-0.5 w-[32%] min-w-0"
            onClick={() => {
              const newPage = Math.max(0, localPage - 2);
              setLocalPage(newPage);
              onUpdateProgress(book.id, newPage);
            }}
          >
            -2P
          </Button>

          {/* 4. +2P */}
          <Button
            variant="outline"
            className="bg-transparent text-[15px] px-1 py-0.5 w-[32%] min-w-0"
            onClick={() => {
              const newPage = Math.min(book.totalPages, localPage + 2);
              setLocalPage(newPage);
              onUpdateProgress(book.id, newPage);
            }}
          >
            +2P
          </Button>
          
          {/* 5. +5P */}
          <Button
            variant="outline"
            className="bg-transparent text-[15px] px-1 py-0.5 w-[32%] min-w-0"
            onClick={() => {
              const newPage = Math.min(book.totalPages, localPage + 5);
              setLocalPage(newPage);
              onUpdateProgress(book.id, newPage);
            }}
          >
            +5P
          </Button>

          {/* 6. +10P */}
          <Button
            variant="outline"
            className="bg-transparent text-[15px] px-1 py-0.5 w-[32%] min-w-0"
            onClick={() => {
              const newPage = Math.min(book.totalPages, localPage + 10);
              setLocalPage(newPage);
              onUpdateProgress(book.id, newPage);
            }}
          >
            +10P
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