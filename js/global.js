/* global twentyseventeenScreenReaderText */
(function( $ ) {

	// Variables and DOM Caching.
	var $body = $( 'body' ),
		$customHeader = $body.find( '.custom-header' ),
		$branding = $customHeader.find( '.site-branding' ),
		$navigation = $body.find( '.navigation-top' ),
		$navWrap = $navigation.find( '.wrap' ),
		$navMenuItem = $navigation.find( '.menu-item' ),
		$menuToggle = $navigation.find( '.menu-toggle' ),
		$menuScrollDown = $body.find( '.menu-scroll-down' ),
		$sidebar = $body.find( '#secondary' ),
		$entryContent = $body.find( '.entry-content' ),
		$formatQuote = $body.find( '.format-quote blockquote' ),
		isFrontPage = $body.hasClass( 'twentyseventeen-front-page' ) || $body.hasClass( 'home blog' ),
		navigationFixedClass = 'site-navigation-fixed',
		navigationHeight,
		navigationOuterHeight,
		navPadding,
		navMenuItemHeight,
		idealNavHeight,
		navIsNotTooTall,
		headerOffset,
		menuTop = 0,
		resizeTimer;

	// Ensure the sticky navigation doesn't cover current focused links.
	$( 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]', '.site-content-contain' ).filter( ':visible' ).focus( function() {
		if ( $navigation.hasClass( 'site-navigation-fixed' ) ) {
			var windowScrollTop = $( window ).scrollTop(),
				fixedNavHeight = $navigation.height(),
				itemScrollTop = $( this ).offset().top,
				offsetDiff = itemScrollTop - windowScrollTop;

			// Account for Admin bar.
			if ( $( '#wpadminbar' ).length ) {
				offsetDiff -= $( '#wpadminbar' ).height();
			}

			if ( offsetDiff < fixedNavHeight ) {
				$( window ).scrollTo( itemScrollTop - ( fixedNavHeight + 50 ), 0 );
			}
		}
	});

	// Set properties of navigation.
	function setNavProps() {
		navigationHeight      = $navigation.height();
		navigationOuterHeight = $navigation.outerHeight();
		navPadding            = parseFloat( $navWrap.css( 'padding-top' ) ) * 2;
		navMenuItemHeight     = $navMenuItem.outerHeight() * 2;
		idealNavHeight        = navPadding + navMenuItemHeight;
		navIsNotTooTall       = navigationHeight <= idealNavHeight;
	}

	// Make navigation 'stick'.
	function adjustScrollClass() {

		// Make sure we're not on a mobile screen.
		if ( 'none' === $menuToggle.css( 'display' ) ) {

			// Make sure the nav isn't taller than two rows.
			if ( navIsNotTooTall ) {

				// When there's a custom header image or video, the header offset includes the height of the navigation.
				if ( isFrontPage && ( $body.hasClass( 'has-header-image' ) || $body.hasClass( 'has-header-video' ) ) ) {
					headerOffset = $customHeader.innerHeight() - navigationOuterHeight;
				} else {
					headerOffset = $customHeader.innerHeight();
				}

				// If the scroll is more than the custom header, set the fixed class.
				if ( $( window ).scrollTop() >= headerOffset ) {
					$navigation.addClass( navigationFixedClass );
				} else {
					$navigation.removeClass( navigationFixedClass );
				}

			} else {

				// Remove 'fixed' class if nav is taller than two rows.
				$navigation.removeClass( navigationFixedClass );
			}
		}
	}

	// Set margins of branding in header.
	function adjustHeaderHeight() {
		if ( 'none' === $menuToggle.css( 'display' ) ) {

			// The margin should be applied to different elements on front-page or home vs interior pages.
			if ( isFrontPage ) {
				$branding.css( 'margin-bottom', navigationOuterHeight );
			} else {
				$customHeader.css( 'margin-bottom', navigationOuterHeight );
			}

		} else {
			$customHeader.css( 'margin-bottom', '0' );
			$branding.css( 'margin-bottom', '0' );
		}
	}

	// Set icon for quotes.
	function setQuotesIcon() {
		$( twentyseventeenScreenReaderText.quote ).prependTo( $formatQuote );
	}

	// Add 'below-entry-meta' class to elements.
	function belowEntryMetaClass( param ) {
		var sidebarPos, sidebarPosBottom;

		if ( ! $body.hasClass( 'has-sidebar' ) || (
			$body.hasClass( 'search' ) ||
			$body.hasClass( 'single-attachment' ) ||
			$body.hasClass( 'error404' ) ||
			$body.hasClass( 'twentyseventeen-front-page' )
		) ) {
			return;
		}

		sidebarPos       = $sidebar.offset();
		sidebarPosBottom = sidebarPos.top + ( $sidebar.height() + 28 );

		$entryContent.find( param ).each( function() {
			var $element = $( this ),
				elementPos = $element.offset(),
				elementPosTop = elementPos.top;

			// Add 'below-entry-meta' to elements below the entry meta.
			if ( elementPosTop > sidebarPosBottom ) {
				$element.addClass( 'below-entry-meta' );
			} else {
				$element.removeClass( 'below-entry-meta' );
			}
		});
	}

	/*
	 * Test if inline SVGs are supported.
	 * @link https://github.com/Modernizr/Modernizr/
	 */
	function supportsInlineSVG() {
		var div = document.createElement( 'div' );
		div.innerHTML = '<svg/>';
		return 'http://www.w3.org/2000/svg' === ( 'undefined' !== typeof SVGRect && div.firstChild && div.firstChild.namespaceURI );
	}

	/**
	 * Test if an iOS device.
	*/
	function checkiOS() {
		return /iPad|iPhone|iPod/.test(navigator.userAgent) && ! window.MSStream;
	}

	/*
	 * Test if background-attachment: fixed is supported.
	 * @link http://stackoverflow.com/questions/14115080/detect-support-for-background-attachment-fixed
	 */
	function supportsFixedBackground() {
		var el = document.createElement('div'),
			isSupported;

		try {
			if ( ! ( 'backgroundAttachment' in el.style ) || checkiOS() ) {
				return false;
			}
			el.style.backgroundAttachment = 'fixed';
			isSupported = ( 'fixed' === el.style.backgroundAttachment );
			return isSupported;
		}
		catch (e) {
			return false;
		}
	}

	// Fire on document ready.
	$( document ).ready( function() {

		// If navigation menu is present on page, setNavProps and adjustScrollClass.
		if ( $navigation.length ) {
			setNavProps();
			adjustScrollClass();
		}

		// If 'Scroll Down' arrow in present on page, calculate scroll offset and bind an event handler to the click event.
		if ( $menuScrollDown.length ) {

			if ( $( 'body' ).hasClass( 'admin-bar' ) ) {
				menuTop -= 32;
			}
			if ( $( 'body' ).hasClass( 'blog' ) ) {
				menuTop -= 30; // The div for latest posts has no space above content, add some to account for this.
			}
			if ( ! $navigation.length ) {
				navigationOuterHeight = 0;
			}

			$menuScrollDown.click( function( e ) {
				e.preventDefault();
				$( window ).scrollTo( '#primary', {
					duration: 600,
					offset: { top: menuTop - navigationOuterHeight }
				});
			});
		}

		adjustHeaderHeight();
		setQuotesIcon();
		if ( true === supportsInlineSVG() ) {
			document.documentElement.className = document.documentElement.className.replace( /(\s*)no-svg(\s*)/, '$1svg$2' );
		}

		if ( true === supportsFixedBackground() ) {
			document.documentElement.className += ' background-fixed';
		}
	});

	// If navigation menu is present on page, adjust it on scroll and screen resize.
	if ( $navigation.length ) {

		// On scroll, we want to stick/unstick the navigation.
		$( window ).on( 'scroll', function() {
			adjustScrollClass();
			adjustHeaderHeight();
		});

		// Also want to make sure the navigation is where it should be on resize.
		$( window ).resize( function() {
			setNavProps();
			setTimeout( adjustScrollClass, 500 );
		});
	}

	$( window ).resize( function() {
		clearTimeout( resizeTimer );
		resizeTimer = setTimeout( function() {
			belowEntryMetaClass( 'blockquote.alignleft, blockquote.alignright' );
		}, 300 );
		setTimeout( adjustHeaderHeight, 1000 );
	});

	// Add header video class after the video is loaded.
	$( document ).on( 'wp-custom-header-video-loaded', function() {
		$body.addClass( 'has-header-video' );
	});

})( jQuery );


jQuery(document).ready(function($) {

  var ResponsiveMenu = {
    trigger: '#responsive-menu-button',
    animationSpeed: 500,
    breakpoint: 0,
    pushButton: 'off',
    animationType: 'slide',
    animationSide: 'left',
    pageWrapper: '',
    isOpen: false,
    triggerTypes: 'click',
    activeClass: 'is-active',
    container: '#responsive-menu-container',
    openClass: 'responsive-menu-open',
    accordion: 'off',
    activeArrow: '▲',
    inactiveArrow: '▼',
    wrapper: '#responsive-menu-wrapper',
    closeOnBodyClick: 'off',
    closeOnLinkClick: 'off',
    itemTriggerSubMenu: 'off',
    linkElement: '.responsive-menu-item-link',
    openMenu: function() {
      $(this.trigger).addClass(this.activeClass);
      $('html').addClass(this.openClass);
      $('.responsive-menu-button-icon-active').hide();
      $('.responsive-menu-button-icon-inactive').show();
      this.setButtonTextOpen();
      this.setWrapperTranslate();
      this.isOpen = true;
    },
    closeMenu: function() {
      $(this.trigger).removeClass(this.activeClass);
      $('html').removeClass(this.openClass);
      $('.responsive-menu-button-icon-inactive').hide();
      $('.responsive-menu-button-icon-active').show();
      this.setButtonText();
      this.clearWrapperTranslate();
      this.isOpen = false;
    },
    setButtonText: function() {
      if($('.responsive-menu-button-text-open').length > 0 && $('.responsive-menu-button-text').length > 0) {
        $('.responsive-menu-button-text-open').hide();
        $('.responsive-menu-button-text').show();
      }
    },
    setButtonTextOpen: function() {
      if($('.responsive-menu-button-text').length > 0 && $('.responsive-menu-button-text-open').length > 0) {
        $('.responsive-menu-button-text').hide();
        $('.responsive-menu-button-text-open').show();
      }
    },
    triggerMenu: function() {
      this.isOpen ? this.closeMenu() : this.openMenu();
    },
    triggerSubArrow: function(subarrow) {
      var sub_menu = $(subarrow).parent().siblings('.responsive-menu-submenu');
      var self = this;
      if(this.accordion == 'on') {
        /* Get Top Most Parent and the siblings */
        var top_siblings = sub_menu.parents('.responsive-menu-item-has-children').last().siblings('.responsive-menu-item-has-children');
        var first_siblings = sub_menu.parents('.responsive-menu-item-has-children').first().siblings('.responsive-menu-item-has-children');
        /* Close up just the top level parents to key the rest as it was */
        top_siblings.children('.responsive-menu-submenu').slideUp(200, 'linear').removeClass('responsive-menu-submenu-open');
        /* Set each parent arrow to inactive */
        top_siblings.each(function() {
          $(this).find('.responsive-menu-subarrow').first().html(self.inactiveArrow);
          $(this).find('.responsive-menu-subarrow').first().removeClass('responsive-menu-subarrow-active');
        });
        /* Now Repeat for the current item siblings */
        first_siblings.children('.responsive-menu-submenu').slideUp(200, 'linear').removeClass('responsive-menu-submenu-open');
        first_siblings.each(function() {
          $(this).find('.responsive-menu-subarrow').first().html(self.inactiveArrow);
          $(this).find('.responsive-menu-subarrow').first().removeClass('responsive-menu-subarrow-active');
        });
      }
      if(sub_menu.hasClass('responsive-menu-submenu-open')) {
        sub_menu.slideUp(200, 'linear').removeClass('responsive-menu-submenu-open');
        $(subarrow).html(this.inactiveArrow);
        $(subarrow).removeClass('responsive-menu-subarrow-active');
      } else {
        sub_menu.slideDown(200, 'linear').addClass('responsive-menu-submenu-open');
        $(subarrow).html(this.activeArrow);
        $(subarrow).addClass('responsive-menu-subarrow-active');
      }
    },
    menuHeight: function() {
      return $(this.container).height();
    },
    menuWidth: function() {
      return $(this.container).width();
    },
    wrapperHeight: function() {
      return $(this.wrapper).height();
    },
    setWrapperTranslate: function() {
      switch(this.animationSide) {
        case 'left':
        translate = 'translateX(' + this.menuWidth() + 'px)'; break;
        case 'right':
        translate = 'translateX(-' + this.menuWidth() + 'px)'; break;
        case 'top':
        translate = 'translateY(' + this.wrapperHeight() + 'px)'; break;
        case 'bottom':
        translate = 'translateY(-' + this.menuHeight() + 'px)'; break;
      }
      if(this.animationType == 'push') {
        $(this.pageWrapper).css({'transform':translate});
        $('html, body').css('overflow-x', 'hidden');
      }
      if(this.pushButton == 'on') {
        $('#responsive-menu-button').css({'transform':translate});
      }
    },
    clearWrapperTranslate: function() {
      var self = this;
      if(this.animationType == 'push') {
        $(this.pageWrapper).css({'transform':''});
        setTimeout(function() {
          $('html, body').css('overflow-x', '');
        }, self.animationSpeed);
      }
      if(this.pushButton == 'on') {
        $('#responsive-menu-button').css({'transform':''});
      }
    },
    init: function() {
      var self = this;
      $(this.trigger).on(this.triggerTypes, function(e){
        e.stopPropagation();
        self.triggerMenu();
      });
      $(this.trigger).mouseup(function(){
        $(self.trigger).blur();
      });
      $('.responsive-menu-subarrow').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        self.triggerSubArrow(this);
      });
      $(window).resize(function() {
        if($(window).width() > self.breakpoint) {
          if(self.isOpen){
            self.closeMenu();
          }
        } else {
          if($('.responsive-menu-open').length>0){
            self.setWrapperTranslate();
          }
        }
      });
      if(this.closeOnLinkClick == 'on') {
        $(this.linkElement).on('click', function(e) {
          e.preventDefault();
          /* Fix for when close menu on parent clicks is on */
          if(self.itemTriggerSubMenu == 'on' && $(this).is('.responsive-menu-item-has-children > ' + self.linkElement)) {
            return;
          }
          old_href = $(this).attr('href');
          old_target = typeof $(this).attr('target') == 'undefined' ? '_self' : $(this).attr('target');
          if(self.isOpen) {
            if($(e.target).closest('.responsive-menu-subarrow').length) {
              return;
            }
            self.closeMenu();
            setTimeout(function() {
              window.open(old_href, old_target);
            }, self.animationSpeed);
          }
        });
      }
      if(this.closeOnBodyClick == 'on') {
        $(document).on('click', 'body', function(e) {
          if(self.isOpen) {
            if($(e.target).closest('#responsive-menu-container').length || $(e.target).closest('#responsive-menu-button').length) {
              return;
            }
          }
          self.closeMenu();
        });
      }
      if(this.itemTriggerSubMenu == 'on') {
        $('.responsive-menu-item-has-children > ' + this.linkElement).on('click', function(e) {
          e.preventDefault();
          self.triggerSubArrow($(this).children('.responsive-menu-subarrow').first());
        });
      }
    }
  };
  ResponsiveMenu.init();
  });