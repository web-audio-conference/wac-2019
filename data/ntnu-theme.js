AUI().ready("liferay-sign-in-modal", function (A) {
  var signIn = A.one(".sign-in > a");

  if (signIn && signIn.getData("redirect") !== "true") {
    signIn.plug(Liferay.SignInModal);
  }

  (function ($) {
    $("a[href='#top']").click(function (e) {
      e.stopPropagation();
      e.preventDefault();
      $("html,body").stop(true, true).animate({ scrollTop: 0 });
      return false;
    });

    $(window).scroll(function () {
      if ($(this).scrollTop() > 1200) {
        $("#to-top:hidden").stop(true, true).fadeIn();
      } else {
        $("#to-top").stop(true, true).fadeOut();
      }
    });
  })(jQuery);

  /**
   * For special sites with their own logo (e.g. Kavli), we want to set the home URL to that sub site instead of the main NTNU site.
   * To do that we:
   * 1. Check whether the header logo image is different from the standard URL logo.
   * 2. If it is, set the href attribute of the home anchor element to the subdomain instead of NTNU's main site.
   */
  var logoImgElement = document.getElementById("header_logo");
  if (logoImgElement) {
    var logoUrl = logoImgElement.getAttribute("src");
    var isSpecialSite = logoUrl.indexOf("/logo_ntnu.svg") === -1;
    if (isSpecialSite) {
      var homePath = "/" + window.location.pathname.split("/")[1] + "/";
      var homeLinkElement = document.getElementById("home_href");
      homeLinkElement.setAttribute("href", homePath);
    }
  }
});

/**
 * Activity indicator
 * small plugin which displays an indicator on ajax requests
 */
AUI().add(
  "activity-indicator",
  function (A) {
    /**
     * Usage:
     *
     * var indicatorNode = A.one('.activityIndicator');
     * indicatorNode.plug(A.plugins.ActivityIndicator);
     * indicatorNode.activityIndicator.start(); // or stop()
     *
     * @param config
     * @constructor
     */

    function ActivityIndicatorPlugin(config) {
      this.widget = config.host;

      // Set style object arriving from the plug operation
      if (config.styles) {
        this.widget.setStyles(config.styles);
      }
      this.widget.addClass("activityCenter");
      this.widget.append(A.Node.create('<div class="activityLoader"></div>'));
      this.widget.one(".activityLoader").hide();
    }

    ActivityIndicatorPlugin.NAME = "ActivityIndicatorPlugin";
    ActivityIndicatorPlugin.NS = "activityIndicator";

    ActivityIndicatorPlugin.prototype = {
      start: function () {
        this.widget.one(".activityLoader").show();
        this.widget.setStyle("min-height", "2em");
      },
      stop: function () {
        this.widget.one(".activityLoader").hide();
        this.widget.setStyle("min-height", "initial");
      },
    };

    A.namespace("plugins").ActivityIndicator = ActivityIndicatorPlugin;
  },
  "1.0.0",
  { requires: ["aui-node", "plugin"] }
);

/*********************************************
 *  SLIDER KARUSELL
 *  Config bxslider
 *********************************************/

AUI().use("aui-module", function (A) {
  var sliderNode = jQuery(".ntnu-bxslider");

  if (sliderNode.length >= 0) {
    sliderNode.each(function (index, el) {
      jQuery(el).bxSlider({
        mode: "horizontal",
        // Captions are derived from the image's title attribute
        captions: false,
        touchEnabled: false,
        infiniteLoop: true,
        preloadImages: "none",
        onSlideAfter: function ($slideElement, oldIndex, newIndex) {},
        onSliderLoad: function (currentIndex) {
          // Fjerner css klasse når bxslider har initialisert
          A.all(".ntnu-bxslider").removeClass("slider-init");
        },
      });
    });
  }
});

AUI().use("aui-base", function (A) {
  // Ensure the DOM is fully loaded before running the script
  A.on("domready", function () {
    const accordions = document.querySelectorAll(".accordion");

    accordions.forEach((accordion) => {
      const header = accordion.querySelector(".accordion-header");
      const body = accordion.querySelector(".accordion-body");
      const arrow = accordion.querySelector(".accordion-arrow");

      header.addEventListener("click", function () {
        const isOpen = body.classList.contains("open");

        // Toggle the clicked accordion
        body.classList.toggle("open", !isOpen);
        arrow.classList.toggle("rotate", !isOpen);
      });
    });
  });
});

/*** Tab panels
 *
 * **/

// Tab-view plugin
AUI().use("aui-tabview", function (A) {
  A.all(".tabbedArticle,.progressArticle").each(function (tab) {
    new A.TabView({
      srcNode: tab,
    }).render();

    var frag = window.location.hash;
    if (frag) {
      var fragNode = tab.one(frag);
      if (fragNode) {
        tab.all(".tab-pane").removeClass("active");
        fragNode.addClass("active");
        tab
          .all("li.tab")
          .removeClass("active")
          .removeClass("tab-selected")
          .removeClass("tab-focused");
        var aNode = tab.one('a[href="' + frag + '"]');
        var li = aNode.ancestor();
        li.addClass("active").addClass("tab-selected").addClass("tab-focused");
      }
    }
  });
});

/**
 * Toggle edit mode with F2
 */
AUI().use("aui-base", "aui-node", function (A) {
  var docBody = A.getBody();
  if (!docBody) {
    return;
  }
  var node = docBody.one("#controlMenu") || docBody;
  var trigger = node.one(".toggle-controls");

  var MAP_TOGGLE_STATE = {
    false: {
      cssClass: "controls-hidden",
      state: "hidden",
    },
    true: {
      cssClass: "controls-visible",
      state: "visible",
    },
  };

  if (trigger) {
    var controlsVisible = Liferay._editControlsState === "visible";
    var currentState = MAP_TOGGLE_STATE[controlsVisible];
    docBody.addClass(currentState.cssClass);

    /*
     * Det ser vanskelig ut å toggle ikonet samtidig
     */
    var toggleControls = function (event) {
      var prevState = currentState;
      controlsVisible = !controlsVisible;
      currentState = MAP_TOGGLE_STATE[controlsVisible];

      docBody.toggleClass(prevState.cssClass);
      docBody.toggleClass(currentState.cssClass);
    };
    // Define new function below
    A.on("key", toggleControls, document, "down:113");
    // 	35 = shift+1, 40 = Shift+2, 34 = Shift+3 , 37 = Shift+4, 12 = Shift+5, 113 = F2, 13 = Enter, 39 = Shift+6
  }
});

/** everything should be ready **/
Liferay.on("allPortletsReady", function () {
  console.log("All portlets are ready");
  /** Check for captions **/
  (function ($) {
    $("img[data-caption]").each(function (dc) {
      var caption = $(
        '<span class="ntnu-caption"><i class="fa fa-camera"></i>' +
          $(this).data("caption") +
          "</span>"
      );
      var parent = $(this).parent();
      var wrap = $('<div class="ntnu-imgwrap"></div>');
      wrap.append($(this));
      wrap.append(caption);
      parent.prepend(wrap);
    });

    /** tablesorter **/
    $.tablesorter && $(".tablesorter").tablesorter();

    /** tooltips **/
    $('[data-toggle="tooltip"]').tooltip();

    /** II-2763  Make side menue mobile friendly **/
    $("#smclosebutton a").click(function () {
      $("#main-content.ntnucolumns").removeClass("smopenmode");
      $("#main-content.ntnucolumns").addClass("smclosemode");
    });
    $("#smopenbutton").click(function () {
      $("#main-content.ntnucolumns").removeClass("smclosemode");
      $("#main-content.ntnucolumns").addClass("smopenmode");
    });

    // WCAG-36 - Carousel elements have aria-hidden=true. Ensure all of its child elements are not focusable.
    $(".karusell-artikkel-innhold *").prop("tabindex", -1);
  })(jQuery);
});
