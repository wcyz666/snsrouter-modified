$(function(){
	$('.message_body').map(function(){
		// Extract and truncate link
		$(this).html($(this).html().replace(/https?:\/\/[a-z0-9:\/%\.\-&?=_;~]+/i, function(link){
			if (r = /(https?:\/\/([a-z0-9:%\.\-]+)\/[a-z0-9:\/%\.\-&?=_;~]+)/i.exec(link)){
			//if (r=/http:\/\/[a-z0-9:\/%\.\-]+[^a-z0-9:\/%\.\-]/.exec(link)){
				return '<a target="_blank" class="truncated_link" href="' + r[1]
						+ '" title="' + r[1]
						+ '" short_href="' + r[2]
						+'">//See more' + '...</a>';
			} else {
				return link;
			}
		}));

		// Collapse long texts
		$(this).css('text-overflow', 'ellipsis');
		$(this).css('line-height', '1.5em');
		//$(this).css('white-space', 'nowrap');
		$(this).css('overflow', 'hidden');
		// Analyze min height
		var _current_h = $(this).css('height').replace('px', '');
		$(this).css('height', '4.5em');
		var _expect_h = $(this).css('height').replace('px', '');
		var _min_h = 0;
		if (parseInt(_current_h) < parseInt(_expect_h)){
			_min_h = _current_h + 'px';
		} else {
			_min_h = _expect_h + 'px';
		}
		//alert(_min_h + "," + _expect_h + "," + _current_h);
		$(this).attr('_expand', 'false');
		$(this).attr('_min_h', _min_h);
		$(this).css('height', _min_h);
		$(this).css('background', '#f0f0f0');
		$(this).click(function () {
			if ($(this).attr('_expand') == 'false') {
				$(this).attr('_expand', 'true');
				$(this).css('height', 'auto');
				$(this).css('background', '#ffffff');
			} else {
				$(this).attr('_expand', 'false');
				$(this).css('height', $(this).attr('_min_h'));
				$(this).css('background', '#f0f0f0');
			}
		});
	});

	// mouse over to expand the link. canceled function
	//$('.truncated_link').map(function(){
	//	$(this).mouseover(function(){
	//		$(this).html($(this).attr('href'));
	//	});
	//	$(this).mouseout(function(){
	//		$(this).html($(this).attr('short_href'));
	//	});
	//});
});



 

function loadImage(e) {
    var u = e.src;
    var url = u + "?" + Math.random();
    e.onerror = null;
    var tmp_frame = document.createElement("iframe");
    document.body.appendChild(tmp_frame);
    tmp_frame.style.display="none";
    tmp_frame.src = "javascript:\"<img src="+url+" onload=setTimeout(frameElement.callback,100); onerror=setTimeout(frameElement.callback,100); />\""
    tmp_frame.callback=function(){e.src=url;document.body.removeChild(tmp_frame)}
}
$(function(){
	
	if (/msie/.test(navigator.userAgent.toLowerCase())) {
  		$('input:checkbox').click(function () {
   			this.blur();  
			this.focus();	
		  });  
 };
});
$(document).ready(function()
    {
		var deleteButton = '<button value="delete" class="del_input">Delete</button><br \>';
		$("select.flexselect").flexselect();
	$(document).on("click",".add_input", function(event)
	{
		var x = $("select.flexselect:eq(0)").clone().removeAttr("style");
		event.preventDefault();
		$(this).parent().append(x).append(deleteButton);
		x.flexselect();
	});
	$(document).on("click", ".del_input", function(event){
		event.preventDefault();
		$(this).prev().remove();
		$(this).next().remove();
		$(this).next().remove();
		$(this).remove();
	});
	original_num = parseInt($('input[name="msg_num"]:eq(0)').attr('value'));
	current_num = original_num;
	$('#hook').hook();
	$('#logo').click(function()
	    {
		window.location.reload();
	    });
	$('#logo').hover(function()
	    {
		$('img[alt="Hook"]').rotate({animateTo:360});
	    },
	    function()
	    {
		$('img[alt="Hook"]').rotate({animateTo:0});
	    });
	$('input[name="msg_num"]').blur(function()
	    {
		if (isNaN($(this).val()) || parseInt($(this).val()) <= 0)
		{
			$(this).val() = current_num;
			return false;
		}
		return true;
	    });
		
	$("input[type='submit']").on('click', function(event)
	{
		event.preventDefault();
		$.post($(this).parent().attr("action"), $(this).parent().serialize(), function(ret){alert(ret);});
	});
	$('button[name="msg_chg"]').click(function()
	    {
		$('input[name="msg_num"]').blur();
		new_num = parseInt($('input[name="msg_num"]:eq(0)').val());
		if (new_num > original_num)
			$.get("home_timeline/msg_num/" + $('input[name="msg_num"]:eq(0)').val(), function(){window.location.reload();});
		else
		    {
		    if (new_num <= current_num)
			$('div[class$="_msg"]:gt(' + (new_num - 1) + ')').fadeOut();
		    else
			$('div[class$="_msg"]:lt(' + new_num + ')').fadeIn();
		    current_num = new_num;
		    $.get("home_timeline/msg_num/" + $('input[name="msg_num"]:eq(0)').val());
		    }
        });
	
	$('input[type="checkbox"]').change(function()
            {
		if ($(this).attr('checked'))	
		{
			$(this).removeAttr('checked');
			$("."+$(this).attr('id')+"_msg").fadeOut();
			var hidden = $("."+$(this).attr('id')+"_msg").length;
			$.get("home_timeline/toggle_close/" + $(this).attr('id'), function()
			{
				if (hidden * 2 > current_num) 
					window.location.reload();
			});
		}	
	
		else
		{
			$(this).attr('checked', "checked")
			if ($("."+$(this).attr('id')+"_msg").length > 0)
				$("."+$(this).attr('id')+"_msg").fadeIn();
			else
                        	$.get("home_timeline/toggle_open/" + $(this).attr('id'), function(){window.location.reload();});
		}
	    }
	);
	$(window).scrollLoading(
		{
			appendTo: $("#msg_container"),
			ajaxData: {
				type: "get",
				url: "/wc.html",
				//headers: {'Cookie': "token=" + $("#token").val()},
				success:function(ret){
					$("#msg_container").append(ret);
					
					var x = $("select:not([class='flexselect'])");
					x.addClass("flexselect");
					x.flexselect();
					$(".extra_message_body").map(function(){
		// Extract and truncate link
		$(this).html($(this).html().replace(/https?:\/\/[a-z0-9:\/%\.\-&?=_;~]+/i, function(link){
			if (r = /(https?:\/\/([a-z0-9:%\.\-]+)\/[a-z0-9:\/%\.\-&?=_;~]+)/i.exec(link)){
			//if (r=/http:\/\/[a-z0-9:\/%\.\-]+[^a-z0-9:\/%\.\-]/.exec(link)){

				return '<a target="_blank" class="truncated_link" href="' + r[1]+ '" title="' + r[1]+ '" short_href="' + r[2]+'">//See more' + '...</a>';
			} else {
				return link;
			}
		}));

		// Collapse long texts
		$(this).css('text-overflow', 'ellipsis');
		$(this).css('line-height', '1.5em');
		//$(this).css('white-space', 'nowrap');
		$(this).css('overflow', 'hidden');
		// Analyze min height
		var _current_h = $(this).css('height').replace('px', '');
		$(this).css('height', '4.5em');
		var _expect_h = $(this).css('height').replace('px', '');
		var _min_h = 0;
		if (parseInt(_current_h) < parseInt(_expect_h)){
			_min_h = _current_h + 'px';
		} else {
			_min_h = _expect_h + 'px';
		}
		//alert(_min_h + "," + _expect_h + "," + _current_h);
		$(this).attr('_expand', 'false');
		$(this).attr('_min_h', _min_h);
		$(this).css('height', _min_h);
		$(this).css('background', '#f0f0f0');
		$(this).click(function () {
			if ($(this).attr('_expand') == 'false') {
				$(this).attr('_expand', 'true');
				$(this).css('height', 'auto');
				$(this).css('background', '#ffffff');
			} else {
				$(this).attr('_expand', 'false');
				$(this).css('height', $(this).attr('_min_h'));
				$(this).css('background', '#f0f0f0');
			}
		});
	});
				$(".extra_message_body").removeClass().addClass("message_body");
				}
			}
		}
	);
    }
);
