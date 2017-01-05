const ObjectLearning = require('object-learning');
const _ = require('underscore');

class DataHunter {
  constructor(dataSet) {
    if (!Array.isArray(dataSet) || !(dataSet.length > 0)) throw (new Error('data set must be a non empty array'));
    this.maxIter = 10000;
    this.dataSet = dataSet;
    this.metaClusters = [];
    this.groupNames = [];
  }

  run(choosenMetaFilter, callback) {
    this.generateClusteringModel((err1) => {
      if (err1) throw err1;
      this.generateMetaClusters((err2, data) => {
        if (err2) throw err2;
        const dataForChoosenMetaFilter = data[choosenMetaFilter];
        console.log(`\n#. Prediction for ${choosenMetaFilter} ${this.metaFilterType} :`);
        let max = 0;
        let bestCluster = 0;
        let bestClusterProbability = 0;
        console.log(`\na. Data for this ${this.metaFilterType} :`);
        console.log('--------------------\n');
        console.log(dataForChoosenMetaFilter);
        console.log(`\nb. Probability for this ${this.metaFilterType} :`);
        console.log('--------------------------------------\n');
        for (let i = 0; i < Object.keys(dataForChoosenMetaFilter.data).length; i += 1) {
          const probability = dataForChoosenMetaFilter.data[i] / dataForChoosenMetaFilter.total;
          console.log(`cluster ${i} :   ${probability}`);
          if (dataForChoosenMetaFilter.data[i] > max) {
            max = dataForChoosenMetaFilter.data[i];
            bestCluster = i;
            bestClusterProbability = probability;
          }
        }
        const bestClusterAverage = this.clusteringModel.groups[bestCluster - 1].groupAvgs;
        callback(bestCluster, bestClusterProbability, bestClusterAverage);
      });
    });
  }

  validClustersParameters(clustersNumber, clustersFilters) {
    // should validate the parameters according to criterians
    return (
      clustersNumber !== undefined
      && clustersNumber > 0
      && Array.isArray(clustersFilters)
      && clustersFilters.length > 0
      && this.maxIter > 100
    );
  }

  validMetaClustersParameters(metaClustersNumber, metaFilterType) {
    // should validate the meta parameters according to criterians
    return (
      metaClustersNumber !== undefined
      && metaClustersNumber > 0
      && _.isString(metaFilterType)
      && this.isDefinedInAllData(metaFilterType)
    );
  }

  setClustersParameters(clustersNumber, clustersFilters) {
    if (!this.validClustersParameters(clustersNumber, clustersFilters)) throw (new Error('invalid parameters for clusters'));

    this.clustersNumber = clustersNumber;
    this.clustersFilters = clustersFilters;
    this.groupNames = [];
    for (let i = 0; i < this.clustersNumber; i += 1) {
      this.groupNames.push(i);
    }
  }

  setMetaClustersParameters(metaClustersNumber, metaFilterType) {
    if (!this.validMetaClustersParameters(metaClustersNumber, metaFilterType)) throw (new Error('invalid parameters for meta clusters'));

    this.metaClustersNumber = metaClustersNumber;
    this.metaFilterType = metaFilterType;
  }

  generateClusteringModel(callback) {
    if (!this.validClustersParameters(this.clustersNumber, this.clustersFilters)) {
      const error = new Error(
        'On generating cluster.\nCluster parameters must be set and valid.\nHave a look to the setClustersParameters method.');
      callback(error, null);
      return;
    }
    this.clusteringModel =
    ObjectLearning.runKClustering(
      this.dataSet,
      this.clustersFilters,
      { maxIter: this.maxIter, groups: this.clustersNumber, groupNames: this.groupNames }
    );
    callback(null, this.clusteringModel);
  }

  generateMetaClusters(callback) {
    if (this.clusteringModel === undefined ||
      !this.validMetaClustersParameters(this.metaClustersNumber, this.metaFilterType)) {
      const error = new Error(
        'On generating meta cluster.\nMeta clusters must be built on top of an existing clustering model.\nHave a look to the generateClusteringMode method.');
      callback(error, null);
      return;
    }
    // building MetaClusters on top of the clustering models
    for (let i = 0; i < this.metaClustersNumber; i += 1) {
      const dataForMetaI = {};
      const data = {};

      dataForMetaI.total = 0;
      this.clusteringModel.groups.forEach((group) => {
        data[group.groupName] = 0;
        group.objects.forEach((object) => {
          if (parseInt(Math.floor(object[this.metaFilterType]), 10) === i) {
            data[group.groupName] += 1;
          }
        });
        dataForMetaI.total += data[group.groupName];
      });
      dataForMetaI.data = data;
      this.metaClusters[i] = dataForMetaI;
    }
    callback(null, this.metaClusters);
  }

  getClusteringModel() {
    this.generateClusteringModel((err) => {
      if (err) throw err;
    });
    return this.clusteringModel;
  }

  getMetaClusters() {
    this.generateMetaClusters((err) => {
      if (err) throw err;
    });
    return this.metaClusters;
  }

  isDefinedInAllData(attribute) {
    let isInAll = true;
    this.dataSet.forEach((datum) => {
      isInAll = isInAll && (datum[attribute] !== undefined);
    });
    return isInAll;
  }
}

module.exports = DataHunter;
