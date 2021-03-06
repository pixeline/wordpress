function toggleOptions(parentOption, childOptions) {
	var display = '';

	if (document.getElementById(parentOption).checked == false) {
		display = 'none';
	}
	for (var i = 0; i < childOptions.length; i++) {
		console.log(childOptions[i]);
		console.log(document.getElementById(childOptions[i]));
		document.getElementById(childOptions[i]).style.display = display;
	}
}

function authFacebook() {
	FB.login(function(response) {
		if (response.authResponse) {
			redirectWithParam('fb_extended_token', 1);
		} else {
			console.log('User cancelled login or did not fully authorize.');
		}
	}, {scope: 'manage_pages, publish_actions, publish_stream'});
}


function redirectWithParam(key, value) {
	key = escape(key); value = escape(value);

	var kvp = document.location.search.substr(1).split('&');
	if (kvp == '') {
		document.location.search = '?' + key + '=' + value;
	}
	else {

		var i = kvp.length; var x; while (i--) {
			x = kvp[i].split('=');

			if (x[0] == key) {
				x[1] = value;
				kvp[i] = x.join('=');
				break;
			}
		}

		if (i < 0) { kvp[kvp.length] = [key, value].join('='); }
    
		document.location.search = kvp.join('&');
	}
}

function fbShowDebugInfo() {
	jQuery("#debug-output").show();
}

// avoid collisions
var FB_WP = FB_WP || {};
FB_WP.admin = {
	friend_suggest: {hint:"Type to find a friend.",noresults:"No friend found."}, // TODO: override me with translations
	page_suggest: {hint:"Type to find a page.",noresults:"No page found."},
	short_number: function(num) {
		if( num > 1000000 ) {
			return Math.round((num/1000000)).toString() + "m";
		} else if( num > 1000 ) {
			return Math.round((num/1000),0).toString() + "k";
		}

		return num;
	},
	token_input: { // loopj jquery-token-input
		friends: function() {
			jQuery("#suggest-friends").tokenInput(ajaxurl + "?" + jQuery.param({"fb-friends":1,"action":"fb_friend_page_autocomplete","autocompleteNonce":FBNonce.autocompleteNonce}), {
				theme: "facebook",
				preventDuplicates: true,
				hintText: FB_WP.admin.friend_suggest.hint,
				animateDropdown: false,
				noResultsText: FB_WP.admin.friend_suggest.noresults,
				resultsFormatter: function(friend) {
					// we want at least a name
					if ( friend.name === undefined ) {
						return "";
					}
					var li = jQuery("<li />");
					// picture served in HTTP scheme
					// no mixed content just to make the list item pretty
					if ( document.location.protocol === "http:" && friend.uid !== undefined ) {
						li.append( jQuery("<img />").attr({width:25,height:25,src:"http://graph.facebook.com/"+friend.uid+"/picture?width=25&height=25",alt:friend.name}).css("margin-right","2em") );
					}
					li.append( jQuery("<span />").text(friend.name).text() );
					return jQuery("<ul />").append(li).html();
				}
			});
		},
		pages: function() {
			jQuery("#suggest-pages").tokenInput(ajaxurl + "?" + jQuery.param({"fb-pages":1,"action":"fb_friend_page_autocomplete","autocompleteNonce":FBNonce.autocompleteNonce}), {
				theme: "facebook",
				preventDuplicates: true,
				hintText: FB_WP.admin.page_suggest.hint,
				animateDropdown: false,
				minChars: 2,
				noResultsText: FB_WP.admin.page_suggest.noresults,
				resultsFormatter: function(page) {
					// we want at least a name
					if ( page.name === undefined ) {
						return "";
					}
					var li = jQuery("<li />");
					// account for no image or image inclusion causing mixed scheme
					if ( document.location.protocol === "http:" && page.image !== undefined ) {
						li.append( jQuery("<img />").attr({width:25,height:25,src:page.image,alt:page.name}).css("margin-right","2em") );
					}
					var text = page.name;
					if ( page.likes !== undefined ) {
						text = text + " (" + FB_WP.admin.short_number(page.likes) + " likes)";
					}
					li.append( jQuery("<span />").text(text).text() );
					return jQuery("<ul />").append(li).html();
				}
			});
		}
	},
	init: function() {
		FB_WP.admin.token_input.friends();
		FB_WP.admin.token_input.pages();
	}
};

jQuery(function() {
	FB_WP.admin.init();
});