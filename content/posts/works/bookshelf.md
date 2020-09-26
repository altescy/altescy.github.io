---
title: "電子書籍をオンライン管理する"
date: 2020-09-26T10:30:21+09:00
hero: "/images/posts/works/bookshelf/hero.jpg"
author:
    name: "Yasuhiro Yamaguchi"
    image: "/images/logo.png"
menu:
  sidebar:
    name: "電子書籍をオンライン管理する"
    identifier: bookshelf
    parent: works
---


## はじめに

最近，書籍を電子版で購入することが増えたことで電子書籍の管理が煩雑になってきました．
多くの場合，電子書籍を購入すると販売サイトから書籍データをダウンロードできて，
それらを自分の端末に入れて読むことになります．また，一つの書籍に対してPDFやEPUB
など複数のフォーマットが用意されていることも多いです．本を購入するたびに増えていく
ファイルを効率よく管理するために，先日[Bookshelf](https://github.com/altescy/bookshelf)
という電子書籍管理のためのWEBアプリをつくりました．

 <a href="https://github.com/altescy/bookshelf"><img src="https://github-link-card.s3.ap-northeast-1.amazonaws.com/altescy/bookshelf.png" width="460px"></a>

これまでは電子書籍の管理のためにDropboxやGoogle Driveなどのクラウドストレージに
ファイルを突っ込んでいたのですが，ファイルへのアクセスが面倒であったり，
ストレージの容量を気にする必要があったりと不満を感じていました．
[Bookshelf](https://github.com/altescy/bookshelf)にはこうした問題を解決するための
機能を実装しました．


## Bookshelf

[Bookshelf](https://github.com/altescy/bookshelf)は電子書籍を管理するための
WEBアプリであり，フロントエンドはVue.js + TypeScript, バックエンドはGo言語で
実装されています．主な特徴は以下のとおりです:

- [書籍情報の登録](#書籍情報の登録)
- [OPDSフィードの配信](#opdsフィードの配信)
- [複数フォーマットの登録](#複数フォーマットの登録)
- [S3互換ストレージへの保存](#s3互換ストレージへの保存)
- [シングルバイナリ](#シングルバイナリ)

書籍のメタ情報はPostgresかSQLite3に，書籍ファイルはローカルのファイルシステムか
S3互換のオブジェクトストレージに保存することができます．また，本やファイルの
追加や削除はすべてブラウザから行えます．


### 書籍情報の登録

[Bookshelf](https://github.com/altescy/bookshelf)では書籍データを保存する際に
著者や出版社，表紙などの書籍情報を合わせて登録します．書籍情報を登録する際は
ISBNを入力すると自動的に他のフィールドを補完するため，効率よく書籍を登録する
ことができます．登録された書籍情報は書籍へのアクセスの利便性を上げるだけでなく，
後述するOPDSフィードの配信にも使われます．

![Bookshelf](/images/posts/works/bookshelf/bookshelf.png)

ISBNによる補完には[openBD](https://openbd.jp/)という検索APIを利用しています．
主要な書籍の情報はだいたい揃っていて，APIの仕様も簡潔なため非常に使いやすいです．


### OPDSフィードの配信

電子書籍を配信するための規格として[OPDS](https://opds.io/)というのがあるようです．
あまり流行ってはいなさそうですが，日本では[オライリー・ジャパン](https://www.oreilly.co.jp/community/blog/2012/02/opds-catalog-available.html)や
[青空文庫](https://www.aozora.gr.jp/)などでOPDSによるカタログの配信が行われて
います．Bookshelfは登録した書籍をOPDSフォーマットで配信することができます．
OPDSフィードへのリンクはヘッダー右側のアイコンから取得できます．

![Bookshelf header](/images/posts/works/bookshelf/bookshelf_header.png)

OPDSに対応したリーダーであれば，このアプリに登録した書籍をPCやスマートフォン
から読むことができます．例えば[Foliate](https://johnfactotum.github.io/foliate/)
というソフトウェアを使うと以下のように書籍の一覧を眺めたりファイルを
ダウンロードしたりできます．このOPDS配信機能とOPDS対応リーダーのおかげで本への
アクセスやローカルでの管理がかなり便利になりました．

![Foliate screenshot](/images/posts/works/bookshelf/foliate_list.png)


### 複数フォーマットの登録

Bookshelfでは一つの書籍についてPDFやEPUBなど複数のフォーマットのファイルを
登録できます．ブラウザからは以下のように登録したファイルがアイコンとして表示
され，クリックするとファイルをダウンロードすることができます．

![Bookshelf item](/images/posts/works/bookshelf/bookshelf_item.png)

またOPDSでも複数のフォーマットを配信しているため，例えばFoliateからは以下の
ようにプルダウンメニューからフォーマットを選択してダウンロードすることができます．

![Foliate screenshot](/images/posts/works/bookshelf/foliate_download.png)


### S3互換ストレージへの保存

書籍ファイルの保存先をS3互換のオブジェクトストレージに設定することができます．
S3互換のストレージには本家のAWS S3やオープンソースの[MinIO](https://min.io/)
などがありますが，私は[wasabi](https://wasabi.com/)を使っています．wasabiは
AWS S3に比べて非常にコスパがよく，API呼び出しや転送に対して課金されないため重宝
しています．(1TB未満なら$6/mo程度です．) これで容量をほとんど気にすることなく
電子書籍を管理できます！


### シングルバイナリ

Bookshelfはシングルバイナリで動作するアプリケーションです．今回，フロントエンド
をバイナリファイルに含めるために[go-bindata-assetfs](https://github.com/elazarl/go-bindata-assetfs)
を使ってみました．これを使うと任意のファイルをGoのコード中にバイナリとして埋め込む
ことができます．
埋め込んだファイルは以下のように`http.FileServer`に渡して配信しています．

```go
	router.NotFound = http.FileServer(&assetfs.AssetFS{
		Asset:     browser.Asset,
		AssetDir:  browser.AssetDir,
		AssetInfo: browser.AssetInfo,
		Prefix:    "/dist",
		Fallback:  "index.html",
	})
```


## 利用方法

`go get`してローカル環境で実行するか，Dockerイメージを用意してWEBアプリを
起動できます．

### go get

以下はローカル環境で動かす例です．この例では現在いるディレクトリに
SQLite3のデータベースファイル`bookshelf.db`と書籍ファイルが保存されるディレクトリ
`files/`が作成されます．
```
$ go get github.com/altescy/bookshelf
$ export BOOKSHELF_DB_URL=sqlite3:///`pwd`/bookshelf.db
$ export BOOKSHELF_STORAGE_URL=file:///`pwd`/files
$ bookshelf
```

### Docker

Dockerイメージをpullして実行します．以下は上記の例と同じようにSQLite3とローカル
ストレージを利用します．
```
$ docker pull altescy/bookshelf:1.2.0
$ docker run -d \
    -v `pwd`:/data \
    -p 8080:8080 \
    -e BOOKSHELF_DB_URL=sqlite3:///data/bookshelf.db \
    -e BOOKSHELF_STORAGE_URL=file:///data/files \
    altescy/bookshelf:1.2.0
```

### docker-compose

以下はdocker-composeを用いた例で，データベースにPostgres，ストレージにMinIO
を利用しています．ストレージに他のAWS互換ストレージを利用する場合は
`BOOKSHELF_STORAGE_URL`と`BOOKSHELF_AWS_*`の値を適当なものに置き換えてください．
```
$ git clone https://github.com/altescy/bookshelf.git
$ cd bookshelf
$ cat << EOF > .env
BOOKSHELF_PORT=80
BOOKSHELF_DB_URL=postgres://user:password@postgres:5432/bookshelf?sslmode=disable
BOOKSHELF_STORAGE_URL=s3://books
BOOKSHELF_CREATE_NEW_STORAGE=1
BOOKSHELF_AWS_ACCESS_KEY_ID=minio_access
BOOKSHELF_AWS_SECRET_ACCESS_KEY=minio_secret
BOOKSHELF_AWS_S3_REGION=us-east-1
BOOKSHELF_AWS_S3_ENDPOINT_URL=http://minio

MINIO_ACCESS_KEY=minio_access
MINIO_SECRET_KEY=minio_secret
MINIO_HOST=0.0.0.0
MINIO_PORT=9000

POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_PORT=5432

TZ=Asia/Tokyo
EOF
$ docker-compose up -d
```

> :warning: 実際に公開して利用する際は，著作権で保護されたコンテンツをオープンに
> してしまわないためにBasic認証などを適切に設定してください．Basic認証を設定した場合，
> OPDSのURLは `https://user:password@example.com/opds` のように設定して利用します．


## おわりに

電子書籍をオンラインで管理するために作ったBookshelfというWEBアプリを紹介
しました．機能は最小限という感じですが，この1ヶ月ほど自分で使ってみて
書籍ファイルの管理がだいぶ楽になったな，という印象です．一方，検索まわりの
機能などは全然手を付けていないのでいろいろと改善できるところはありそうです．
ただ，このアプリをあまり高機能なものにしようとは考えていないので，これからも
ミニマルな仕様を保ちつつちょこちょこと改良していければと思います．
