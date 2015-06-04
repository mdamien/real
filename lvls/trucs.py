from os import listdir
from os.path import isfile, join
files = [ f for f in listdir(".") if isfile(f) and f.endswith('json')]
for f in files:
    filename = f.split('.')[0]
    print('cat {1}.json  | node clean_json.js > {1}2.json'
        +' && mv {1}2.json {1}.json'.format(filename))