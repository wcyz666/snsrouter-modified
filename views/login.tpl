%include header title="Login"

%if state == "new":
	<form method="POST" action="/login">
	Username: <input type="text" name="username" length=20 /> 
	<br />
	Password: <input type="text" name="password" length=20 /> 
	<br />
	<input type="submit" />
	</form>
	<p>
	<a href="/">Back to Home</a>
	</p>
	<p>
	Note, default username and password are all "test". 
	Please configure "conf/srfe.json" accordingly. 
	</p>
%elif state == "succ":
	Login successful!
	<p>
	<a href="/">Back to Home</a>
	</p>
%elif state == "fail":
	Login fail!
	<p>
	<a href="/login">Back to Login</a>
%else:
	Unknown state..?
%end

%include footer
