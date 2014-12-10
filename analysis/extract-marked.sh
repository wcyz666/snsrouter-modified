#!/bin/bash
#
# Extract terms in marked messages. For simple topic mining. 

mkdir -p data

# sqlite> select * from tag;
# 1|null
# 2|mark
# 3|gold
# 4|silver
# 5|bronze
# 6|news
# 7|interesting
# 8|shit
# 9|nonsense

sql="sqlite3 srfe.db"

function process_tag_category(){
	condition=$1
	suffix=$2
	$sql "select text from msg,msg_tag where msg_id=msg.id and ($condition)" > data/text.mark.$suffix
	cat data/text.mark.$suffix | python wordseg.py  | sort | uniq -c | sort -nr > kdb/term.mark.$suffix
	$sql "select username from msg,msg_tag where msg_id=msg.id and ($condition)" > data/tag.user.$suffix
	cat data/tag.user.$suffix | sort | uniq -c | sort -nr > kdb/user.mark.$suffix
}

process_tag_category "tag_id>=2 and tag_id<=5" "tech"
process_tag_category "tag_id=6" "news"
process_tag_category "tag_id=7" "interesting"
process_tag_category "tag_id>=8 and tag_id<=9" "nonsense"

#echo "dumping texts from database..."
#
#$sql "select text from msg,msg_tag where msg_id=msg.id and (tag_id>=2 and tag_id<=5)" > data/text.mark.tech
#$sql "select text from msg,msg_tag where msg_id=msg.id and (tag_id=6)" > data/text.mark.news
#$sql "select text from msg,msg_tag where msg_id=msg.id and (tag_id=7)" > data/text.mark.interesting
#$sql "select text from msg,msg_tag where msg_id=msg.id and (tag_id>=8 and tag_id<=9)" > data/text.mark.nonsense
#
#echo "word segmenting..."
#
#cat data/text.mark.tech | python wordseg.py  | sort | uniq -c | sort -nr > kdb/term.mark.tech
#cat data/text.mark.news | python wordseg.py  | sort | uniq -c | sort -nr > kdb/term.mark.news
#cat data/text.mark.interesting | python wordseg.py  | sort | uniq -c | sort -nr > kdb/term.mark.interesting
#cat data/text.mark.nonsense | python wordseg.py  | sort | uniq -c | sort -nr > kdb/term.mark.nonsense

exit 0 
