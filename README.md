# Hunters, brace yourselves.

`data-hunter` is a module that acts as a black-box extracting sense to a dataset (an array of JavaScript objects).

On top of k-means clustered dataset, data-hunter can build a layer of meta-filters to estimate probabilities of a certain meta-data to be in each clusters. Meaning, you can hunt with a higher probability to hit.

## Usage

To install DataHunter, simply run:

```JavaScript
  npm install data-hunter

  DataHunter = require('data-hunter');
```

### K-means clustering

This module use the k-means algorithm provided in the object-learning module (https://github.com/johngoddard/ObjectLearning).

```JavaScript
  const customers = [
    CustomerRequest { time: 18.15, latitude: -115.13997, longitude: 36.17192 },
  	CustomerRequest { time: 18.33, latitude: -115.13997, longitude: 36.17192 },
  	CustomerRequest { time: 11.2, latitude: -115.13997, longitude: 36.17192 },
  	CustomerRequest { time: 11.2, latitude: -115.13997, longitude: 36.17192 },
  	CustomerRequest { time: 11.2, latitude: -115.13997, longitude: 36.17192 },
  	CustomerRequest { time: 11.23, latitude: -115.13997, longitude: 36.17192 },
  	CustomerRequest { time: 11.56, latitude: -115.13997, longitude: 36.17192 },
  ];

  const dataHunter = new DataHunter(customers)
  // asking for 3 clusters related to the latitude and longitude
  dataHunter.setClustersParameters(3, ['latitude', 'longitude']);
  const clusteringModel = dataHunter.getClusteringModel();
  
```
### Probabilities estimation

Having those row clusters is interesting, right. But hunting data in it can reveal a real business value.
DataHunter can build a layer of meta-filter (must be an attribute of the data) to estimate the probabilities to find a data in each clusters.

```JavaScript

  const customers = [
    CustomerRequest { time: 18.15, latitude: -115.13997, longitude: 36.17192 },
  	CustomerRequest { time: 18.33, latitude: -115.13997, longitude: 36.17192 },
  	CustomerRequest { time: 11.2, latitude: -115.13997, longitude: 36.17192 },
  	CustomerRequest { time: 11.2, latitude: -115.13997, longitude: 36.17192 },
  	CustomerRequest { time: 11.2, latitude: -115.13997, longitude: 36.17192 },
  	CustomerRequest { time: 11.23, latitude: -115.13997, longitude: 36.17192 },
  	CustomerRequest { time: 11.56, latitude: -115.13997, longitude: 36.17192 },
  ];

  const choosenHout = 11;
  const dataHunter = new Datahunter(customers)
  // asking for 3 clusters related to the latitude and longitude
  dataHunter.setClustersParameters(3, ['latitude', 'longitude']);
  // seting the meta-filter 'time' to categorize the clusters according to the time of the request
  dataHunter.setMetaClustersParameters(24, 'time');
  const metaClusters = dataHunter.getMetaClusters();

```
### Complete run example

First you need to define how you want to cluster your data and which information do you want to hunt (filter) on top of it.
Here, we use latitude and longitude as parameters for clustering our dataset.
Each cluster can be considered as an area wrapping a part of the data.
Each area is centered around an average value.

We use the time (24 hours) of the request as a meta-filter to estimate the probability to find a customer in each of the area.
DataHunter returns the best probability and the best clusters for a given hour.

```JavaScript

  const customers = [
    CustomerRequest { time: 18.15, latitude: -115.13997, longitude: 36.17192 },
  	CustomerRequest { time: 18.33, latitude: -115.13997, longitude: 36.17192 },
  	CustomerRequest { time: 11.2, latitude: -115.13997, longitude: 36.17192 },
  	CustomerRequest { time: 11.2, latitude: -115.13997, longitude: 36.17192 },
  	CustomerRequest { time: 11.2, latitude: -115.13997, longitude: 36.17192 },
  	CustomerRequest { time: 11.23, latitude: -115.13997, longitude: 36.17192 },
  	CustomerRequest { time: 11.56, latitude: -115.13997, longitude: 36.17192 },
  ];

  const choosenHour = 11;
  const dataHunter = new Datahunter(customers)
  // asking for 3 clusters related to the latitude and longitude
  dataHunter.setClustersParameters(3, ['latitude', 'longitude']);
  // seting the meta-filter 'time' to categorize the clusters according to the time of the request
  dataHunter.setMetaClustersParameters(24, 'time');

  // running analytics return the bestCluster, its probability and the corresponding cluster's parameters average (here it is the
  // latitude and longitude)
  dataHunter.run(choosenHour, (bestCluster, bestClusterProbability, bestClusterAverage) => {
    console.log('\nc. Interpretation : ');
    console.log('--------------------\n');
    console.log(`At ${choosenHour}, the highest probability to find a customer request is in the cluster : ${bestCluster}`);
    console.log(`The cluster ${bestCluster} is centered around :${JSON.stringify(bestClusterAverage, null, 2)}`);
  });

```

All you need for hunting is now up to go
