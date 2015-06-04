from os import listdir
from os.path import isfile, join
files = [ f for f in listdir(".") if isfile(f) and f.endswith('.json')]
for f in files:
    filename = f.split('.')[0]
    if not filename.endswith("2"):
        print(('cat {f}.json  | node clean_json.js > {f}2.json'
            +'\nmv {f}2.json {f}.json').format(f=filename))