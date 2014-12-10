%include header title="SQL"

<h1> SQL </h1>

% setdefault('submit', False)

<form method="POST" action="/sql">
SELECT msg.id,msg.pyobj FROM msg,msg_tag WHERE <br />
<textarea name="condition" cols=50 rows=5>
%if submit:
{{condition}}
%end
</textarea>
<input type="submit" />
</form>

<p>
<a href="/">Back to Home</a>
</p>

<hr />
%if submit:

	%for s in sl:
	<div>
		<a target="_new" href="/raw/{{!s.msg_id}}">[raw]</a>

		%if s.platform == "SinaWeiboStatus":
		<img src="http://weibo.com/favicon.ico" />
		%elif s.platform == "RenrenStatus":
		<img src="http://xnimg.cn/favicon.ico" />
		%elif s.platform == "RenrenShare":
		<img src="http://xnimg.cn/favicon.ico" />
		%elif s.platform == "TencentWeiboStatus":
		<img src="http://t.qq.com/favicon.ico" />
		%elif s.platform == "SQLite":
		<img src="http://www.sqlite.org/favicon.ico" />
		%elif s.platform == "TwitterStatus":
		<img src="https://twitter.com/favicon.ico" />
		%elif s.platform == "RSS":
		<img src="http://www.girlmeetsdress.com/images/Favicon_RSS.jpg" />
		%elif s.platform == "RSS2RW":
		<img src="http://www.girlmeetsdress.com/images/Favicon_RSS.jpg" />
		%elif s.platform == "Email":
		<img src="https://mail.google.com/favicon.ico" />
		%end

		<b>{{s.parsed.username}}</b> @ <i>{{snsapi_utils.utc2str(s.parsed.time)}}</i>
		<a target="_new" href="/flag/seen/{{!s.msg_id}}">[Mark as Seen]</a>
		<p>
		{{s.parsed.text}}
		<br />
		%for (k,v) in tags.items():
			<a target="_new" href="/tag/{{k}}/{{!s.msg_id}}">{ {{v}} }</a>
		%end
		<br />
		<form target="_new" method="POST" action="/forward/{{!s.msg_id}}">
		<input name="comment" type="text" />
		<input type="submit" />
		</form>
		</p>

	</div>
	%end

%end

%include footer
