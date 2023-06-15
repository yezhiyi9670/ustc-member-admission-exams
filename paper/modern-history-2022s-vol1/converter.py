import json

manifest = json.load(open("manifest.json", 'r', encoding='UTF-8'))

data = {
	'manifest': manifest,
	'problems': []
}
problems:list = data['problems']

lines = [s.strip().split(',') for s in open('problems.csv', 'r', encoding='UTF-8').readlines() if s.strip() != '']
# print(lines)

for i in range(len(lines)):
	index = i + 1
	line = lines[i]
	module = line[0]
	typ = {'判断题': 'single', "单选题": 'single', '多选题': 'multi', '填空题': 'blank'}[line[1]]
	desc = line[2]
	difficulty = line[5]
	option_count = int(line[7])
	
	options = line[8 : 8 + option_count]
	selectors = ['A', 'B', 'C', 'D']
	
	prob = {
		'id': index,
		'type': typ,
		'desc': module + ' | ' + difficulty,
		'extras': [desc]
	}

	if(typ == 'blank'):
		prob['choice'] = {}
		prob['answer'] = options[0]
	else:
		choices = {}
		for t in range(len(options)):
			choices[selectors[t]] = options[t]
		prob['choice'] = choices
		prob['answer'] = line[3]
	
	problems.append(prob)

json.dump(data, open('paper.json', 'w', encoding='UTF-8'), ensure_ascii=False)
