var restaurantsApp = angular.module('restaurantsApp', ['ngRoute']);

restaurantsApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/restaurants', {
                controller: 'restaurantsListController',
                templateUrl: 'partials/restaurants.html'
            }).
            when('/restaurants/:id', {
                controller: 'restaurantViewController',
                templateUrl: 'partials/restaurant.html'
            }).
            otherwise({
                redirectTo: '/restaurants'
            });
    }]);

restaurantsApp.factory("restaurants", ['$http', function($http) {
    return {
        load: function() {
            return $http.get('restaurants.json');
            /*
            return [
                {id: 1, type: 'pizzeria', title: 'Челентано', rating: 2.3, distance: 190, lat:46.631757465817344, lng:32.61420249938965},
                {id: 2, type: 'fast-food', title: 'FORSAЖ', rating: 5, distance: 560, lat:46.67239511091892, lng:32.64317035675049},
                {id: 3, type: 'coffee-shop', title: 'Chento per Chento', rating: 4.1, distance: 2110, lat:46.69761799999986, lng:32.702674999999886},
                {id: 4, type: 'pizzeria', title: 'Белиссима', rating: 4.3, distance: 350, lat:46.67590885589193, lng:32.6486265108687},
                {id: 5, type: 'pizzeria', title: 'Пиццерия на Ленина', rating: 3.6, distance: 490, lat:46.672636332820744, lng:32.64399160617479},
                {id: 6, type: 'pizzeria', title: 'Эллада', rating: 2.9, distance: 190, lat:46.63910955914056, lng:32.61412739753723}
            ];
            */
        },
        filterById: function(restaurants, id) {
            var results = restaurants.filter(function(restaurant) {
                return restaurant.id == id;
            });
            return results.length>0 ? results[0] : false;
        }
    }
}]);

restaurantsApp.factory("googleMap", function() {
    var googleMap = {
        map: null,
        markers: []
    };

    googleMap.buildMap = function(lat, lng) {
        googleMap.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 11,
            center: new google.maps.LatLng(lat, lng)
        });
    };

    googleMap.reloadMarkers = function(restaurants) {
        var reloadMarkers = [], marker;
        angular.forEach(restaurants, function(restaurant, key) {
            marker = new google.maps.Marker({
                position: new google.maps.LatLng(restaurant.lat, restaurant.lng),
                title: restaurant.title
            });
            marker.setIcon('images/green-icon.png');
            this[key] = marker;
        }, reloadMarkers);
        googleMap.markers = reloadMarkers;
    };

    googleMap.clearMarkers = function() {
        var key;
        for(key=0; key<googleMap.markers.length; key++) {
            googleMap.markers[key].setMap(null);
        }
        googleMap.infoWindows=[];
    };

    googleMap.onMarker = function(key) {
        googleMap.markers[key].setIcon("images/red-icon.png");
    };

    googleMap.offMarker = function(key) {
        googleMap.markers[key].setIcon("images/green-icon.png");
    };

    googleMap.addMarkers = function(restaurants) {
        googleMap.clearMarkers();
        googleMap.reloadMarkers(restaurants);
        angular.forEach(googleMap.markers, function(marker, key) {
            marker.setMap(googleMap.map);
            googleMap.infoWindows[key] = new google.maps.InfoWindow({
                content: restaurants[key].title
            });
            google.maps.event.addListener(marker, 'click', function() {
                googleMap.infoWindows[key].open(googleMap.map, marker);
            });
        });
    };

    googleMap.reloadMap = function(restaurants) {
        google.maps.event.trigger(googleMap.map, 'resize');
    };

    return googleMap;
});

restaurantsApp.controller('restaurantsListController', ['$scope', 'restaurants', 'googleMap', function($scope, restaurants, googleMap) {
    restaurants.load().success(function(restaurants) {
        $scope.restaurants = restaurants;
        $scope.map = googleMap;
        googleMap.buildMap(46.631757465817344, 32.61420249938965);
        googleMap.addMarkers($scope.restaurants);
    }).error(function() {
        console.log('Ошибка загрузки данных');
    });
}]);


restaurantsApp.controller('restaurantViewController', ['$scope', '$routeParams', 'restaurants', 'googleMap', function($scope, $routeParams, restaurants, googleMap) {
    restaurants.load().success(function(data) {
        var restaurant;
        if(restaurant = restaurants.filterById(data, $routeParams.id))
        {
            $scope.restaurant = restaurant;
            $scope.googleMap = googleMap;
            googleMap.buildMap(46.631757465817344, 32.61420249938965);
            googleMap.addMarkers([restaurant]);
        }
    }).error(function() {
        console.log('Ошибка загрузки данных');
    });
}]);