const ObjectLearning = require('object-learning');
const _ = require('underscore');
const fs = require('fs');

class DataHunter {
  constructor(dataSet) {
    if (!Array.isArray(dataSet) || !(dataSet.length > 0)) throw (new Error('data set must be a non empty array'));
    this.maxIter = 10000;
    this.dataSet = dataSet;
    this.metaClusters = [];
    this.groupNames = [];
  }

  run(chosenMetaFilter, callback) {
    this.generateClusteringModel((err1) => {
      if (err1) throw err1;
      this.runWithoutSubClustersGeneration(chosenMetaFilter, callback);
    });
  }

  runWithoutSubClustersGeneration(chosenMetaFilter, callback) {
    if (!this.validClusteringModel(this.clusteringModel)) throw (new Error('On running shallow analysis.\nShould have proper clusteringModel before running.\nHave a look at the setClusteringModel method'));
    this.generateMetaClusters((err2) => {
      if (err2) throw err2;
      this.runWithoutGeneration(chosenMetaFilter, callback);
    });
  }

  runWithoutAnyGeneration(chosenMetaFilter, callback) {
    if (!this.validMetaClusters(this.metaClusters)) throw (new Error('On running shallow analysis.\nShould have proper metaClusters before running.\nHave a look at the setMetaClusters method'));
    const dataForChosenMetaFilter = this.metaClusters[chosenMetaFilter];
    console.log(`\n#. Prediction for ${chosenMetaFilter} ${this.metaFilterType} :`);
    let max = 0;
    let bestCluster = 0;
    let bestClusterProbability = 0;
    console.log(`\na. Data for this ${this.metaFilterType} :`);
    console.log('--------------------\n');
    console.log(dataForChosenMetaFilter);
    console.log(`\nb. Probability for this ${this.metaFilterType} :`);
    console.log('--------------------------------------\n');
    for (let i = 0; i < Object.keys(dataForChosenMetaFilter.data).length; i += 1) {
      const probability = dataForChosenMetaFilter.data[i] / dataForChosenMetaFilter.total;
      console.log(`cluster ${i} :   ${probability}`);
      if (dataForChosenMetaFilter.data[i] > max) {
        max = dataForChosenMetaFilter.data[i];
        bestCluster = i;
        bestClusterProbability = probability;
      }
    }
    const bestClusterAverage = this.clusteringModel.groups[bestCluster - 1].groupAvgs;
    callback(bestCluster, bestClusterProbability, bestClusterAverage);
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

  validMetaClusters(metaClusters) {
    return (
      metaClusters !== undefined
      && metaClusters.length === this.metaClustersNumber
      && this.containsRightNumberOfSubClusters(metaClusters)
    );
  }

  validClusteringModel(clusteringModel) {
    return (
      clusteringModel !== undefined
      && clusteringModel.groups.length === this.clustersNumber
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
      callback(null, error);
      return;
    }
    this.clusteringModel =
    ObjectLearning.runKClustering(
      this.dataSet,
      this.clustersFilters,
      { maxIter: this.maxIter, groups: this.clustersNumber, groupNames: this.groupNames }
    );
    fs.writeFileSync('./data/clustering-model.json', `${JSON.stringify(this.clusteringModel, null, 2)}\n`);
    callback(this.clusteringModel, null);
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
    fs.writeFileSync('./data/meta-clusters.json', `${JSON.stringify(this.metaClusters, null, 2)}\n`);
    callback(this.metaClusters, null);
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

  setMetaClusters(metaClusters) {
    if (!this.validMetaClusters(metaClusters)) throw (new Error('invalid metaClusters'));
    this.metaClusters = metaClusters;
  }

  setClusteringModel(clusteringModel) {
    if (!this.validClusteringModel(clusteringModel)) throw (new Error('invalid clusteringModel'));
    this.clusteringModel = clusteringModel;
  }


  isDefinedInAllData(attribute) {
    let isInAll = true;
    this.dataSet.forEach((datum) => {
      isInAll = isInAll && (datum[attribute] !== undefined);
    });
    return isInAll;
  }

  containsRightNumberOfSubClusters(metaClusters) {
    // should ensure that metaClusters are taking all the clusters (this.clustersNumber)
    // into account in their data attribute
    let rightNumber = true;
    metaClusters.forEach((datum) => {
      rightNumber = rightNumber && (Object.keys(datum.data).length === this.clustersNumber);
    });
    return rightNumber;
  }
}

module.exports = DataHunter;
