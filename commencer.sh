mkdir -p data

sql="sqlite3 srfe_queue.db"

$sql "select text from msg" > data/text.all
$sql "select username from msg" > data/user.all

mkdir -p kdb

cat data/text.all | python analysis/wordseg.py  | sort | uniq -c | sort -nr > kdb/term.all
cat data/user.all | sort | uniq -c | sort -nr > kdb/user.all

function process_tag_category(){
condition=$1
suffix=$2
$sql "select text from msg,msg_tag where msg_id=msg.id and ($condition)" > data/text.mark.$suffix
cat data/text.mark.$suffix | python analysis/wordseg.py  | sort | uniq -c | sort -nr > kdb/term.mark.$suffix
$sql "select username from msg,msg_tag where msg_id=msg.id and ($condition)" > data/tag.user.$suffix
cat data/tag.user.$suffix | sort | uniq -c | sort -nr > kdb/user.mark.$suffix
}

tagids=$($sql "select id from tag")


for id in $tagids
do
    tagname=$($sql "select name from tag where id=($id)")
    process_tag_category "tag_id=($id)" $tagname
    echo "tag_id=$id"
#process_tag_category $id[0] $id[1]
done

python genudict.py
python gentdict.py

exit 0