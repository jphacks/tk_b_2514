// OpenBD API types and utilities

export interface OpenBDBook {
  isbn: string;
  title: string;
  volume: string;
  series: string;
  publisher: string;
  pubdate: string;
  cover: string;
  author: string;
  authorKana: string;
  isbn13: string;
  isbn10: string;
  itemCaption: string;
  salesDate: string;
  itemPrice: number;
  itemUrl: string;
  affiliateUrl: string;
  smallImageUrl: string;
  mediumImageUrl: string;
  largeImageUrl: string;
  chirayomiUrl: string;
  reviewCount: number;
  reviewAverage: number;
  booksGenreId: string;
}

export interface OpenBDResponse {
  onix: {
    RecordReference: string;
    NotificationType: string;
    ProductIdentifier: {
      ProductIDType: string;
      IDValue: string;
    }[];
    DescriptiveDetail: {
      ProductComposition: string;
      ProductForm: string;
      ProductFormDetail: string;
      TitleDetail: {
        TitleType: string;
        TitleElement: {
          TitleElementLevel: string;
          TitleText: {
            collationkey: string;
            content: string;
          };
          Subtitle: {
            collationkey: string;
            content: string;
          };
        }[];
      };
      Contributor: {
        SequenceNumber: string;
        ContributorRole: string[];
        PersonName: {
          collationkey: string;
          content: string;
        };
        PersonNameInverted: {
          collationkey: string;
          content: string;
        };
      }[];
      Language: {
        LanguageRole: string;
        LanguageCode: string;
        CountryCode: string;
      }[];
      Extent: {
        ExtentType: string;
        ExtentValue: string;
        ExtentUnit: string;
      }[];
    };
    PublishingDetail: {
      Imprint: {
        ImprintName: {
          collationkey: string;
          content: string;
        };
      };
      Publisher: {
        PublisherName: {
          collationkey: string;
          content: string;
        };
      }[];
      PublishingDate: {
        PublishingDateRole: string;
        Date: string;
      }[];
    };
    ProductSupply: {
      SupplyDetail: {
        ProductAvailability: string;
        Price: {
          PriceType: string;
          PriceAmount: string;
          CurrencyCode: string;
        }[];
      }[];
    };
  };
  hanmoto: {
    datecreated: string;
    datemodified: string;
    datepublished: string;
    isbn: string;
    isbn10: string;
    isbn13: string;
    title: string;
    volume: string;
    series: string;
    publisher: string;
    pubdate: string;
    cover: string;
    author: string;
    authorKana: string;
    itemCaption: string;
    salesDate: string;
    itemPrice: number;
    itemUrl: string;
    affiliateUrl: string;
    smallImageUrl: string;
    mediumImageUrl: string;
    largeImageUrl: string;
    chirayomiUrl: string;
    reviewCount: number;
    reviewAverage: number;
    booksGenreId: string;
  };
  summary: {
    isbn: string;
    title: string;
    volume: string;
    series: string;
    publisher: string;
    pubdate: string;
    cover: string;
    author: string;
    authorKana: string;
    itemCaption: string;
    salesDate: string;
    itemPrice: number;
    itemUrl: string;
    affiliateUrl: string;
    smallImageUrl: string;
    mediumImageUrl: string;
    largeImageUrl: string;
    chirayomiUrl: string;
    reviewCount: number;
    reviewAverage: number;
    booksGenreId: string;
  };
}

export interface BookInfo {
  title: string;
  author: string;
  publisher: string;
  coverImage: string;
  isbn: string;
}

/**
 * OpenBD APIから本の情報を取得
 */
export async function fetchBookInfo(isbn: string): Promise<BookInfo | null> {
  try {
    const response = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OpenBDResponse[] = await response.json();

    // デバッグ用：APIレスポンスをコンソールに出力
    console.log("OpenBD API Response:", JSON.stringify(data, null, 2));

    if (!data || data.length === 0 || !data[0]) {
      console.log("No data found for ISBN:", isbn);
      return null;
    }

    const bookData = data[0];
    const summary = bookData.summary;
    const onix = bookData.onix;

    // デバッグ用：各セクションの内容を確認
    console.log("Summary data:", summary);
    console.log("Onix data:", onix);

    // 表紙画像を複数のソースから取得
    const coverImage = getCoverImage(summary, isbn);

    return {
      title: summary.title || "タイトル不明",
      author: summary.author || "著者不明",
      publisher: summary.publisher || "出版社不明",
      coverImage: coverImage,
      isbn: summary.isbn,
    };
  } catch (error) {
    console.error("Error fetching book info:", error);
    return null;
  }
}

/**
 * booksGenreIdからジャンルを推定
 */
function getGenreFromBooksGenreId(booksGenreId: string): string {
  if (!booksGenreId) {
    console.log("No booksGenreId provided, using magazine");
    return "magazine";
  }

  console.log("BooksGenreId:", booksGenreId);

  // ジャンルIDの最初の2桁で大分類を判定
  const category = booksGenreId.substring(0, 2);

  switch (category) {
    case "00": // 総記
    case "01": // 哲学
    case "02": // 歴史
    case "03": // 社会科学
      console.log("Classified as philosophy");
      return "philosophy";
    case "04": // 自然科学
    case "05": // 技術
    case "06": // 産業
      console.log("Classified as study");
      return "study";
    case "90": // 文学
    case "91": // 日本文学
    case "92": // 中国文学
    case "93": // 英米文学
    case "94": // ドイツ文学
    case "95": // フランス文学
    case "96": // その他の外国文学
    case "97": // 詩歌
    case "98": // 戯曲
    case "99": // その他の文学
      console.log("Classified as novel");
      return "novel";
    default:
      console.log("Unknown category, using magazine");
      return "magazine";
  }
}

/**
 * ISBNのバリデーション
 */
export function validateISBN(isbn: string): boolean {
  // ISBN-10またはISBN-13の形式チェック
  const cleanISBN = isbn.replace(/[-\s]/g, "");
  return /^(\d{10}|\d{13})$/.test(cleanISBN);
}

/**
 * ISBNを正規化（ハイフンを除去）
 */
export function normalizeISBN(isbn: string): string {
  return isbn.replace(/[-\s]/g, "");
}

/**
 * 表紙画像を複数のソースから取得
 */
function getCoverImage(summary: any, isbn: string): string {
  // 1. OpenBDのsummaryから取得
  const openbdCover =
    summary.cover ||
    summary.largeImageUrl ||
    summary.mediumImageUrl ||
    summary.smallImageUrl;

  if (openbdCover && isValidImageUrl(openbdCover)) {
    console.log("Cover from OpenBD:", openbdCover);
    return openbdCover;
  }

  // 2. 国立国会図書館の書影API
  const ndlCover = `https://ndlsearch.ndl.go.jp/thumbnail/${isbn}.jpg`;
  console.log("Trying NDL cover:", ndlCover);

  // 3. opencover API
  const opencoverUrl = `https://image.opencover.jp/v1/cover/spine/${isbn}.webp`;
  console.log("Trying opencover:", opencoverUrl);

  // 4. Google Books API
  const googleBooksUrl = `https://books.google.com/books/content?id=${isbn}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
  console.log("Trying Google Books:", googleBooksUrl);

  // 5. Open Library API
  const openLibraryUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  console.log("Trying Open Library:", openLibraryUrl);

  // デフォルトはopencoverを使用（より確実）
  return opencoverUrl;
}

/**
 * 画像URLが有効かどうかをチェック
 */
function isValidImageUrl(url: string): boolean {
  if (!url || url.trim() === "") return false;

  // 基本的なURL形式チェック
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * ジャンルに基づいて推定ページ数を取得
 */
function getEstimatedPages(genre: string): number {
  switch (genre) {
    case "study":
      return 400; // 技術書は通常400ページ程度
    case "novel":
      return 250; // 小説は通常250ページ程度
    case "philosophy":
      return 300; // 哲学書は通常300ページ程度
    case "magazine":
      return 150; // 雑誌は通常150ページ程度
    default:
      return 300; // デフォルト
  }
}
