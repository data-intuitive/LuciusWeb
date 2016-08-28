(function(document) {
  'use strict';

  var app = document.querySelector('#app');
  app.route = 'null';

  // GLOBALS // SINGLETONS // CONFIG //
  app.data = [];
  app.dataTop = [];
  app.signature = 'HSPA1A DNAJB1 BAG3 P4HA2 HSPA8 TMEM97 SPR DDIT4 HMOX1 -TSEN2';
  app.compound = '';

  // Colors are optmized for color blindness and contrast
  // http://colorbrewer2.org/?type=diverging&scheme=RdYlBu&n=5
  app.colors = [
    'rgb(44,123,182)',
    'rgb(171,217,233)',
    'rgb(255,255,191)',
    'rgb(253,174,97)',
    'rgb(215,25,28)'
  ];

  // PERSISTENT SETTINGS //
  // change version when default settings change
  var version = 5;
  app.settings = JSON.parse(localStorage.getItem('settings'));
  if (!app.settings || !app.settings.version || app.settings.version !== version) {
    app.settings = localStorage.setItem('settings', JSON.stringify({
        version: version,
        url: 'http://ly-1-09:8090/jobs',
        queryString: 'context=compass&appName=luciusapi&sync=true',
        classPath: 'luciusapi',
        sourireURL: 'http://wt-1-00:9999',
        hist2dNoise: 0,
        hist2dBins: 20,
        plotNoise: 3,
        histBins: 16,
        topComps: 25,
        hideInfo: false
      })) || JSON.parse(localStorage.getItem('settings'));
  }

  // set routes and menu items
  // NOTE: check if #pages/section/data-route == routes.name
  app.routes = [
    // [0] is the Default Route
    {name: 'dashboard', title: '', menu: 'Dashboard'},
    {name: 'settings', title: 'Settings', menu: 'Settings'}
  ];

  app.addEventListener('template-bound', function() {
    console.log('POLYMER READY');

    var pages = document.querySelector('#pages');

    var doRouting = function() {
      var currentRoute = this.getRoute();
      for (var i = 0, ii = app.routes.length; i < ii; i++) {
        if (app.routes[i].name.indexOf(currentRoute) > -1) {
          app.route = app.routes[i].name;
          app.pageTitle = app.routes[i].title;
          break;
        }
      }
    };

    var routes = {};
    for (var j = app.routes.length - 1; j >= 0; j--) {
      routes['/' + app.routes[j].name] = doRouting;
    }

    var router = new Router(routes).init(app.routes[0].name);

    // navigation control
    app.navigate  = function(e) {
      e.preventDefault();
      router.setRoute(e.target.dataset.route);
    };

    app.closeDrawer = function() {
      this.$.drawerPanel.closeDrawer();
    };

    // handle page selection
    pages.addEventListener('core-select', function(e) {
      if (e.srcElement.nodeName === 'CORE-ANIMATED-PAGES') {
        var items = e.detail.item.querySelectorAll('[graph]');
        for (var i = items.length - 1; i >= 0; i--) {
          items[i].fire('section-active', e.detail.isSelected);
        }
      }
    });

    pages.addEventListener('core-animated-pages-transition-prepare', function() {
      var item = pages.selectedItem;
      var items = item.querySelectorAll('[graph]');
      for (var i = items.length - 1; i >= 0; i--) {
        items[i].fire('transition-prepare');
      }

      /// hide search bar if not in dashboard
      if (item.dataset.route.indexOf('dash') !== -1) {
        app.$.search.classList.remove('hidden');
      } else {
        app.$.search.classList.add('hidden');
      }
    });

    // Set faster duration for core-animated-pages transitions
    CoreStyle.g.transitions.duration = '0.3s';

  });

  // wrap document so it plays nice with other libraries
  // http://www.polymer-project.org/platform/shadow-dom.html#wrappers
})(wrap(document));
