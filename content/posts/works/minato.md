---
draft: true
title: "WebやS3上のファイルにアクセスするためのPythonライブラリ"
date: 2021-05-16T17:00:00+09:00
hero: "/images/posts/works/minato/hero.jpg"
author:
    name: "Yasuhiro Yamaguchi"
    image: "/images/logo.png"
menu:
  sidebar:
    name: "WebやS3上のファイルにアクセスするためのPythonライブラリ"
    identifier: minato
    parent: works
---

![usage](/images/posts/works/minato/usage.png)

## はじめに

Web上やAWS S3上のファイルへのアクセスを簡単にするために [Minato](https://github.com/altescy/minato) というPythonライブラリの開発を行っています．
Minatoの機能は大きく以下の３つです:

- オンラインファイルに対する読み書き
- オンラインファイルのローカルへのキャッシュ
- ローカルのキャッシュファイルの管理

この記事ではこれらの機能と Minato の基本的な使い方について紹介します．

 <a href="https://github.com/altescy/minato"><img src="https://github-link-card.s3.ap-northeast-1.amazonaws.com/altescy/minato.png" width="460px"></a>



## ファイルの読み書き

Minatoを使うことで，通常のPythonでのローカルファイルへの読み書きと同じような手順でオンラインのファイルにアクセスすることができます．
次の例からわかるように，MinatoはURLのスキームから適切なファイルシステムを自動的に選択して使用します．

```python
import minato

# Web上のファイルへの読み込み
with minato.open("http://example.com/path/to/file", "r") as f:
    content = f.read()

# S3上のファイルへの書き込み
with minato.open("s3://your_bucket/path/to/file", "w") as f:
    f.write("Create a new file on AWS S3!")

# ローカルのファイルへの書き込み
with minato.open("/path/to/local/file", "w") as f:
    f.write("Create a new file on a local storage!")
```


## キャッシュの利用

Web上の大きなデータを読む場合に，ローカルにキャッシュを置くことで何度もファイルをダウンロードすることなくアクセスすることができます．
Minatoでは `cached_path` というメソッドを使うことでURLからローカルのキャッシュへのパスを取得できます．
キャッシュが存在していない場合は指定したURLのファイルが自動的にダウンロードされます．
(AllenNLPで実装されている [`cached_path`](https://github.com/allenai/allennlp/blob/v2.4.0/allennlp/common/file_utils.py#L202) と同様な機能です)

```python
import minato

local_path = minato.cached_path("https://example.com/path/to/large/file")
with open(local_path) as fp:
    content = fp.read()
```


## キャッシュの管理

Minatoにはダウンロードされたキャッシュを管理するためのCLIが実装されています．
このCLIを使って，キャッシュされているファイルの確認や，キャッシュの追加，削除，更新などを行うことができます．

```bash
# キャッシュの一覧表示
$ minato list
id url                                     size
== ======================================= =========
1  https://example.com/path/to/large/file1 512.0 MiB
2  https://example.com/path/to/large/file2 1.1 GiB

# キャッシュの削除
$ minato remove 1
1 files will be deleted:
  [1] https://example.com/path/to/large/file1
Delete these caches? y/[n]: y
Cache files were successfully deleted.

# ファイルの再ダウンロード
$ minato update 2
1 files will be updated:
  [2] https://example.com/path/to/large/file2
Update these caches? y/[n]: y
Cache files were successfully updated.
```


## おわりに

オンラインのファイルにアクセスするためのPythonライブラリ [Minato](https://github.com/altescy/minato) を紹介しました．
Minatoは，現在開発中の [pdpcli](https://github.com/altescy/pdpcli) や [automlcli](https://github.com/altescy/automlcli) におけるオンラインリソースへの読み書き機能を切り出して共通化する目的で開発を始めました．
今後はこれらのライブラリにMinatoを利用しつつ改善を進めていく予定です．
