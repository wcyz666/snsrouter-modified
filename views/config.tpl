%include header
<style>
	.hide {
		display: none;
	}
	fieldset{
		width:500px;
	}
</style>
<script>
	%include js/jquery.min.js
</script>
<script>
$(document).ready(function(){
	$('body > select').on('change',function()
	{
		$('section').hide();
		$('section[id="type_'+$("option:selected").attr("id")+'"]').show();
	});
	$(".del").click(function(event){
		event.preventDefault();
		var x = $("td:first", $(this).parent().parent()).html();
		$.get("/del/" + x, function() 
		{
			alert("The channel has been deleted!");
			$("td:contains(" + x + ")").parent().remove();
		});
	});
	$(".del_pr").click(function(event){
		event.preventDefault();
		var x = $("td:first", $(this).parent().parent()).html();
		alert(x);
		//$.get("/del/" + x, function() 
		//{
		//	alert("The channel has been deleted!");
		//	$("td:contains(" + x + ")").parent().remove();
		//});
	});
	var deleteButton = '<button value="delete" class="del_input">Delete</button><br \>';
	$(document).on("click",".add_input", function(event)
	{
		var x = $("#select").clone();
		event.preventDefault();
		$(this).parent().append(x).append(deleteButton);
	});
	$(document).on("click", ".del_input", function(event){
		event.preventDefault();
		$(this).prev().remove();
		$(this).next().remove();
		$(this).remove();
	});
	$("#submit").on('click', function(event)
	{
		event.preventDefault();
		$.post($(this).parent().parent().attr("action"), $(this).parent().parent().serialize(), function(ret){alert(ret);});
	});
});
	
</script>

<h1> SNSRouter Config Page </h1>


<p>
<a href="/">Back to Home</a>
</p>

<h2> Create a channel </h2>

<select name = "platform">
	<option id = "1" selected = "selected">Renren, Weibo and Tencent</option>
	<option id = "2">Twitter</option>
	<option id = "3">Facebook</option>
	<option id = "4">Email</option>
	<option id = "5">RSS</option>
</select>
<div id = "new">
<section id="type_1" class="">
	<fieldset>
		<legend>New Channel for Renren, Weibo, Tencent, Douban and Instagram</legend>
		<form id="channel_edit" method="POST" action="/newchannel">
			<label>Name *</label>
			<div><input id="channel_name" type="text" name="channel_name" required/></div>
            <label>Type *</label>
			<div><select id="channel_platform" name="channel_platform">
			<option selected = "selected" value = "RenrenFeed">RenrenFeed</option>
			<option value="SinaWeiboStatus">SinaWeiboStatus</option>
			<option value="TencentWeiboStatus">TencentWeiboStatus</option>
			<option value="InstagramFeed">InstagramFeed</option>
			<option value="DoubanFeed">DoubanFeed</option>
			</select></div>
			<label>APP key *</label>
			<div><input id="channel_key" type="text" name="channel_key" required/></div>
			<label>APP secret *</label>
			<div><input id="channel_secret" type="text" name="channel_secret" required/></div>
			<input type="submit" value="Submit" /> <input type="button" id="cat_edit_cancel" value="Cancel" />
		</form>
	</fieldset>
</section>
<section id="type_2" class="hide">
	<fieldset>
		<legend>New Channel for Twitter</legend>
		<form id="channel_edit" method="POST" action="/newchannel">
			<label>Name *</label>
			<div><input id="channel_name" type="text" name="channel_name" required/></div>
			<label>APP key *</label>
			<div><input id="channel_key" type="text" name="channel_key" required/></div>
			<label>APP secret *</label>
			<div><input id="channel_secret" type="text" name="channel_secret" required/></div>
			<label>Access key *</label>
			<div><input id="channel_key_access" type="text" name="channel_key_access" required/></div>
			<label>Access secret *</label>
			<div><input id="channel_secret_access" type="text" name="channel_secret_access" required/></div>
			<input type="hidden" name="channel_platform" value="TwitterStatus" />
			<input type="submit" value="Submit" /> <input type="button" id="cat_edit_cancel" value="Cancel" />
		</form>
	</fieldset>
</section>
<section id="type_3" class="hide">
	<fieldset>
		<legend>New Channel for Facebook</legend>
		<form id="channel_edit" method="POST" action="/newchannel">
			<label>Name *</label>
			<div><input id="channel_name" type="text" name="channel_name" required/></div>
			<label>APP key *</label>
			<div><input id="channel_key" type="text" name="channel_key" required/></div>
			<label>APP secret *</label>
			<div><input id="channel_secret" type="text" name="channel_secret" required/></div>
			<label>Access token *</label>
			<div><input id="channel_key_access" type="text" name="channel_token" required/></div>
			<input type="hidden" name="channel_platform" value="FacebookFeed" />
			<input type="submit" value="Submit" /> <input type="button" id="cat_edit_cancel" value="Cancel" />
		</form>
	</fieldset>
</section>
<section id="type_4" class="hide">
	<fieldset>
		<legend>New Channel for Email</legend>
		<form id="channel_edit" method="POST" action="/newchannel">
			<label>Name *</label>
			<div><input id="channel_name" type="text" name="channel_name" required/></div>
			<label>Email Address*</label>
			<div><input id="channel_addr" type="email" name="channel_addr" required/></div>
			<label>Username *</label>
			<div><input id="channel_username" type="text" name="channel_username" required/></div>
			<label>Password *</label>
			<div><input id="channel_password" type="password" name="channel_password" required/></div>
			<label>IMAP host *</label>
			<div><input id="channel_imap_host" type="text" name="channel_imap_host" required/></div>
			<label>IMAP port *</label>
			<div><input id="channel_imap_port" type="number" name="channel_imap_port" required/></div>
			<label>SMTP host *</label>
			<div><input id="channel_smtp_host" type="text" name="channel_smtp_host" required/></div>
			<label>SMTP port *</label>
			<div><input id="channel_smtp_port" type="number" name="channel_smtp_port" required/></div>
			<input type="hidden" name="channel_platform" value="Email" />
			<input type="submit" value="Submit" /> <input type="button" id="cat_edit_cancel" value="Cancel" />
		</form>
	</fieldset>
</section>
<section id="type_5" class="hide">
	<fieldset>
		<legend>New Channel for RSS</legend>
		<form id="channel_edit" method="POST" action="/newchannel" >
			<label>Name *</label>
			<div><input id="channel_name" type="text" name="channel_name" required/></div>
			<label>RSS URL *</label>
			<div><input id="channel_url" type="url" name="channel_url" required/></div>
			<input type="hidden" name="channel_platform" value="RSS" />
			<input type="hidden" name="channel_method" value="home_timeline" />
			<input type="submit" value="Submit" /> <input type="button" id="cat_edit_cancel" value="Cancel" />
		</form>
	</fieldset>
</section>
</div>
<h2> Current Channel Management </h2>

<table border=1>

	<tr>
		<th>channel name</th>
		<th>open</th>
		<th>expire_after (s)</th>
		<th>authed?</th>
		<th>platform</th>
		<th>methods</th>
		<th>operation</th>
	</tr>
%if not info == {}:
	%for conf in info.values():
		<tr>
			<td>{{conf['channel_name']}}</td>
			<td>{{conf['open']}}</td>
			<td>{{conf['expire_after']}}</td>
			<td>{{conf['is_authed']}}</td>
			<td>{{conf['platform']}}</td>
			%if 'methods' in conf:
				<td>{{conf['methods']}}</td>
			%else:
				<td>N/A</td>
			<td><a href="#" class="del">DELETE</a></td>
			%end
		</tr>
	%end
%end
</table>

<h2> Auth Flow Management </h2>

<p>
	Current channel waiting for second stage:
	%if not ap == {}:
	{{ap.current_channel}}
	%end
</p>

<table border=1>

	<tr>
		<th>channel name</th>
		<th>go to auth</th>
	</tr>
%if not info == {}:
	%for conf in info.values():
		<tr>
			%#if not conf['is_authed']:
			%if True:
				<td>{{conf['channel_name']}}</td>
				<td> 
				%if conf['need_auth']:
					<a href="/auth/first/{{conf['channel_name']}}" target="_new">
						Go Authorization -->
					</a>
				</td>
				%else:
					This platform does not need two stage auth. 
				%end
			%end
		</tr>
	%end
%end
</table>

<h2> Feature Weight </h2>
%if not q == {}:
	%if q.score:
		<table border=1>
			<tr>
				<th> Feature </th>
				<th> Weight </th>
			</tr>
		%for (f, w) in q.score.feature_weight.iteritems():
			<tr>
				<td> {{f}} </td>
				<td> {{w}} </td>
			</tr>
		%end
		</table>
	%else:
		<p>
		Ranking function is disabled and there is not weighting information to show. 
		</p>
	%end
%end
<h2> Tags </h2>

<i> Parent field is not enabled in this version </i>

<table border=1>
	<tr>
		<th> id </th>
		<th> name </th>
		<th> visible </th>
		<th> parent </th>
		<th> Toggle </th>
	</tr>
%if not q == {}:
	%for t in q.tags_all.values():
		<tr>
			<td> {{t['id']}} </td>
			<td> {{t['name']}} </td>
			<td> {{t['visible']}} </td>
			<td> {{t['parent']}} </td>
			<td>
				<a href="/config/tag/toggle/{{t['id']}}">
					Toggle
				</a>
			</td>
		</tr>
	%end
%end
</table>

<form method="POST" action="/config/tag/add">
	Add new tag:
	<br />
	<input type="text" name="name" />
	<input type="submit" />
</form>

<table id = "pr" border=1>
 <tr>
  <th> tag </th>
  <th> relation </th>
  <th> tag </th>
  <th> operation </th>
 </tr>
%if not pr is {}:
%for t in pr:
 <tr>
  <td> {{t[0]}} </td>
  <td> overweigh </td>
  <td> {{t[1]}} </td>
  <td><a href="#" class="del_pr">DELETE</a></td>
 </tr>
%end
%end
</table>
<h3>Config preference</h3>
<form method = "POST", action = "/config/preference" onsubmit="return false">
<div>
<input type="submit" value="submit" id="submit">
</div>
<div id="select" style="float: left;">
<select name = "winner">
<option value="null">null</option>
%for t in q.tags_all.values():
 <option value="{{t['name']}}">{{t['name']}}</option> 
%end
</select><span>overweigh</span>
<select name = "loser">
<option value="null">null</option>
%for t in q.tags_all.values():
 <option value="{{t['name']}}">{{t['name']}}</option> 
%end
</select>
</div> 
<button value="Add more" class="add_input">Add more</button><br \>

</form>
%include footer
