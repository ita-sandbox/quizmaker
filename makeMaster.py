import glob

filename = "master.html" 
html = "index.html"
jsons  = glob.glob("questions/*.json")
js = "app.js"

# 結合対象のテキストファイルを指定（例: 同じフォルダ内の .txt）
with open(filename, "w", encoding="utf-8") as outfile:
    with open(html, "r", encoding="utf-8") as infile:
              # ファイル名の見出しを入れる
            for line in infile:
                # javascriptのソースコードの読み込み位置まで加える
                if '<script src="app.js"></script>' in line:
                    break
                outfile.write(line)
 
with open(filename, "a", encoding="utf-8") as outfile:
    for fname in jsons:
        with open(fname, "r", encoding="utf-8") as infile:
            # ファイル名の見出しを入れる
            # id = fname.split("\\")[-1].replace(".json", "")
            id = fname.replace("\\", "/")
            outfile.write('<!-- ================= JSON データ ================= -->\n')
            outfile.write(f'<script id="{id}" type="application/json">\n')
            outfile.write(infile.read())
            outfile.write("\n</script>\n\n")

with open(filename, "a", encoding="utf-8") as outfile:
    with open(js, "r", encoding="utf-8") as infile:
        outfile.write('<!-- ================= JavaScript ================= -->\n')
        outfile.write('<script>\n')
        outfile.write(infile.read())
        outfile.write("\n</script>\n")
        outfile.write("\n</body>\n</html>")