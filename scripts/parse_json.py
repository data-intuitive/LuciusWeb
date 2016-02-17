import json
import csv

with open("output.json") as file:
    data = json.load(file)

csv_file = csv.writer(open('output.csv','wb+'), quotechar='\t')

for item in data['result']:
	csv_file.writerow(item)
	print item[0], "%2.15f" % item[1]
