# data-hunter
`data-hunter` is a module that acts as a black-box extracting sense to an array of JavaScript objects as a dataset.\nOn top of k-means clustered dataset, data-hunter can build a layer of meta-filters to estimate probabilities of a certain meta-data to be in each clusters.

## Usage

To install DataHunter, simply run @not yet available:

```JavaScript
  npm install data-hunter
```

### k-means clustering
This module use the k-means algorithm provided in the object-learning module (https://github.com/johngoddard/ObjectLearning).
You can run normalized k-means clustering on a set of objects by running `ObjectLearning#runKClustering`:

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

  const dataHunter = new Datahunter(customers)
  // asking for 9 clusters related to the latitude and longitude
  dataHunter.setClustersParameters(9, ['latitude', 'longitude']);
  const clusteringModel = dataHunter.getClusteringModel();
  
```
### probabilities estimation

Having those row clusters is interesting but, making sense of it can return a real business value. DataHunter can build a layer of meta-filter (must be an attribute of the data) to estimate the probabilities to find a data in each clusters given a meta-filter value.

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
  // asking for 9 clusters related to the latitude and longitude
  dataHunter.setClustersParameters(9, ['latitude', 'longitude']);
  // seting the meta-filter 'time' to categorize the clusters according to the time of the request
  dataHunter.setMetaClustersParameters(24, 'time');
  const metaClusters = dataHunter.getMetaClusters();

```
### complete run example

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
  // asking for 9 clusters related to the latitude and longitude
  dataHunter.setClustersParameters(9, ['latitude', 'longitude']);
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
