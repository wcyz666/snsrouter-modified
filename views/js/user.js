
function recoveryInit()
{
	document.getElementById('reem').focus();
	document.getElementById('success').style.display="none";
	document.getElementById('load').style.display="none";
}
function GetXmlHttpObject(){
	var xmlHttp=null;
	try
	 {
	 // Firefox, Opera 8.0+, Safari
	 xmlHttp=new XMLHttpRequest();
	 }
	catch (e)
	 {
	 //Internet Explorer
	 try
	  {
	  xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
	  }
	 catch (e)
	  {
	  xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
	  }
	 }
	return xmlHttp;
}
function recovery(){
	var xmlHttp=GetXmlHttpObject();
	var returnList;
	document.getElementById('load').style.display="block";
	if (xmlHttp==null)
	 {
		 alert ("Browser does not support HTTP Request");
		 	document.getElementById('load').style.display="none";
	 	 return;
	 }
	var email = document.getElementById("reem").value;
	var pat = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/g;
	if (pat.exec(email) == null)
	{
		alert("Please input a valid Email address");
			document.getElementById('load').style.display="none";
		return false;	
	}
	var url="mailer.php?";
	url=url+"sid="+Math.random();
	xmlHttp.open("POST",url,true);
	xmlHttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	xmlHttp.send("email="+email);

	xmlHttp.onreadystatechange=function(){

		if (xmlHttp.readyState==4 || xmlHttp.readyState=="complete") {
				var	response=xmlHttp.responseText;
				response=parseInt(xmlHttp.responseText);
				if (response == 1)
				{
					alert("Sorry, this Email address is not valid.");
					document.getElementById('load').style.display="none";
					return false;	
				}
				if (response == 2)
				{
					alert("Please input an Email address, No injection flaw here");
					document.getElementById('load').style.display="none";
					return false;	
				}
				if (response == 3)
				{
					document.getElementById('load').style.display="none";
					document.getElementById('success').style.display="block";
					return false;
				}
								
		}
			
	};
	
	
}	
function loginform(){
	
	if (typeof(document.getElementById('password').value)== "undefined") 
	{
		alert('Password can\'t be empty!');
		location.href='login.php';
		return false;
	}
	else
	if ( typeof(document.getElementById('email').value)== "undefined") 
	{
		alert('Username can\'t be empty!');
		location.href='login.php';
		return false;
	}
	else
	$('#loginform').submit();
}
function resetform(){
	pass = document.getElementById('password').value;
	pass1 = document.getElementById('password1').value;
	if ((typeof(document.getElementById('password').value)== "undefined") && (document.getElementById('password').value != document.getElementById('password1').value))
	{
		alert('The new password you input is inconsistent!');
		location.href='reset.php';
		return false;
	}
	else
	if ( ( typeof(document.getElementById('password').value)== "undefined") || (typeof(document.getElementById('password1').value)== "undefined")) 
	{
		alert('New password can\'t be empty!');
		location.href='reset.php';
		return false;
	}
	else
	if (typeof(document.getElementById('password_old').value)== "undefined")
	{
		alert('Old password can\'t be empty!');		
		location.href='reset.php';
		return false;
	}
	else
	$('#resetform').submit();
}

$('#yzm').keyup(function(event){
  if(event.keyCode ==13){
    loginform();
  }
});
/*function test(id)
       {
           var temp = document.getElementById(id);
           //瀵圭數瀛愰偖浠剁殑楠岃瘉
            var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
            if(!myreg.test(temp.value))
           {
                 alert('鎻愮ず\n\n璇疯緭鍏ユ湁鏁堢殑E_mail锛�');
                 myreg.focus();
                return false;
          }
        }*/