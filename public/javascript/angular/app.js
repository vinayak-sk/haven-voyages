var app = angular.module("voyages", []); 
		
app.controller("voyageController", function($scope,$http,removeDuplicates,creatVoyagesSingleRoute,creatVoyagesMultipleRoute) {
	var url = "jsonData/portCalls.json";
	$scope.startDate = new Date("2016-01-01 00:00:00");
	$scope.endDate = new Date("2016-01-30 00:00:00");
	$scope.routeGroups = [];
	$scope.voyages = [];
	$scope.transshipments = false;
	
	$http.get(url)
		.then(function(response) {
			$scope.portsCalls = response.data.calls;
	});
	
	$scope.addDateRange = function() {
		$scope.routeGroups = [];
		for(var i=0; i<$scope.portsCalls.length; i++){
			var callElement = $scope.portsCalls[i];
			var etd = ($scope.portsCalls[i].etd === null) ? null : new Date($scope.portsCalls[i].etd);
			if(etd >= $scope.startDate && $scope.endDate >= (new Date($scope.portsCalls[i+1].eta))){
				$scope.routeGroups.push($scope.portsCalls[i]);
				$scope.routeGroups.push($scope.portsCalls[i+1]);
			}
		}
		$scope.routeGroups = removeDuplicates.removeDuplicates($scope.routeGroups);
	};
	
	$scope.generateVoyages = function() {
		$scope.voyages = [];
		if($scope.routeGroups.length == 0){
			$scope.addDateRange();
		}
		if(!$scope.transshipments){
			$scope.voyages = creatVoyagesSingleRoute.listOfVoyages($scope.routeGroups);
		}
		else{
			$scope.voyages = creatVoyagesMultipleRoute.listOfVoyages($scope.routeGroups);
		}
	};
});

app.service('removeDuplicates', function(){
	this.removeDuplicates = function(arr){
		arr = arr.filter(function(elem, index, self) {
		    return index == self.indexOf(elem);
		});
		return arr;
	};
});

app.service('creatVoyagesSingleRoute', function(){
	this.listOfVoyages = function(arr){
		var voyages = [];
		
		for(var i=0; i<arr.length-1; i++){
			for (var j = i + 1; j < arr.length; j++) {
				if(arr[i].routeId === arr[j].routeId){
					var startPort = arr[i].port;
					var endPort = arr[j].port;
					var etd = arr[i].etd;
					var eta = arr[j].eta;
					var vessel = arr[i].vessel;
					var tempVoyage = { "startPort": startPort, "endPort":endPort, "vessel":vessel, "etd":etd, "eta":eta};
					voyages.push(tempVoyage);
				}
			}
		}
		return voyages;
	};
});

app.service('creatVoyagesMultipleRoute', function(creatVoyagesSingleRoute){
	this.listOfVoyages = function(arr){
		var voyages = [];
		var tempTransVoyages = [];
		var i,j = 0;
		voyages = creatVoyagesSingleRoute.listOfVoyages(arr);
		for(i=0;i<voyages.length;i++){
			for(j=i+1;j<voyages.length;j++){
					if((new Date(voyages[i].eta) < new Date(voyages[j].etd)) && (voyages[i].vessel != voyages[j].vessel)){
						var startPort = voyages[i].startPort;
						var endPort = voyages[j].endPort;
						var etd = voyages[i].etd;
						var eta = voyages[j].eta;
						if(voyages[i].vessel != voyages[j].vessel){
							var vessel = voyages[i].vessel + " + " + voyages[j].vessel;
						}
						else{
							var vessel = voyages[i].vessel;
						}
						var tempVoyage = { "startPort": startPort, "endPort":endPort, "vessel":vessel, "etd":etd, "eta":eta};
						tempTransVoyages.push(tempVoyage);
					}
			}
		}
		for(i=0; i<tempTransVoyages.length; i++){
			voyages.push(tempTransVoyages[i]);
		}
		return voyages;
	};
});