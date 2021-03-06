"use strict";

const readline = require("readline");

module.exports = class AthenaExpress {
	constructor(init) {
		validateConstructor(init);
		this.config = {
			athena: new init.aws.Athena({ apiVersion: "2017-05-18" }),
			s3: new init.aws.S3({ apiVersion: "2006-03-01" }),
			s3Bucket:
				init.s3 ||
				`s3://Geospatial-Platform-${init.aws.config.credentials.accessKeyId
					.substring(0, 10)
					.toLowerCase()}-${new Date().getFullYear()}`,
			db: "cgp-metadata-search-dev",
			aws,
			getStats: true
		};
	}

	async query(event, context, callback)  {
		let keyword = event.keyword;
		let theme = event.theme; 
		var sqlQuery = "SELECT properties.id AS id, properties.type AS type, properties.individualName AS individualName, properties.organisationName.'lang' AS organisationName, properties.title.'lang' AS title, properties.published AS published, properties.description.'lang' AS description, properties.keyword.'lang' AS keyword, properties.topicCategory AS topicCategory, properties.westBoundLongitude as westBoundLongitude, properties.southBoundLatitude as southBoundLatitude, properties.eastBoundLongitude as eastBoundLongitude, properties.northBoundLatitude as northBoundLatitude FROM cgp_metadata_lake WHERE keywords LIKE '%" + keyword + "%' OR title LIKE '%" + keyword + "%' OR description LIKE '%" + keyword + "%' ";
		if (theme != null) {
			if (theme == "language")
				sqlQuery = sqlQuery + " AND theme = 'language'";
			else if (theme == "type")
				sqlQuery = sqlQuery + " AND theme = 'type'";
			else if (theme == "individualName")
				sqlQuery = sqlQuery + " AND theme = 'individualName'";
			else if (theme == "organisationName")
				sqlQuery = sqlQuery + " AND theme = 'organisationName'";
			else if (theme == "dateStart")
				sqlQuery = sqlQuery + " AND theme = 'dateStart'";
			else if (theme == "dateEnd")
				sqlQuery = sqlQuery + " AND theme = 'dateEnd'";
			else if (theme == "coordinates")	
				sqlQuery = sqlQuery + " AND westBoundLongitude BETWEEN (geometry.coordinates[0,0] - 1, geometry.coordinates[0,0] + 1) AND  southBoundLatitude BETWEEN(geometry.coordinates[0,1] - 1, geometry.coordinates[0,1] + 1) AND  eastBoundLongitude BETWEEN(geometry.coordinates[1,0] - 1, geometry.coordinates[1,0] + 1) AND  northBoundLatitude BETWEEN(geometry.coordinates[2,1] - 1, geometry.coordinates[2,1] + 1)";
			}
		const config = this.config;
		let results = await athenaExpress.query(sqlQuery);
		console.log("Query is : "+ sqlQuery);
		if (!config)
			throw new TypeError("Config object should be presented in the constructor");

		if (!sqlQuery) throw new TypeError("Missing SQL query");

		try {
			const queryExecutionId = await startQueryExecution(sqlQuery, config);
			const queryStatus = await checkIfExecutionCompleted(
				queryExecutionId,
				config
			);

			const s3Output =
					queryStatus.QueryExecution.ResultConfiguration
						.OutputLocation,
				statementType = queryStatus.QueryExecution.StatementType;
					results.Items = await getQueryOutputFromS3({
						s3Output,
						statementType,
						config
					});

			return results;
		} catch (error) {
			throw new callback(error, null);
		}
	}
};

function startQueryExecution(sqlQuery, config) {

	const params = {
		sqlQuery,
		ResultConfiguration: {
			OutputLocation: config.s3Bucket
		}
	};
}

function checkIfExecutionCompleted(QueryExecutionId, config) {
	let retry = config.retry;
	return new Promise(function(resolve, reject) {
		const keepCheckingRecursively = async function() {
			try {
				let data = await config.athena
					.getQueryExecution({ QueryExecutionId })
					.promise();
				if (data.QueryExecution.Status.State === "SUCCEEDED") {
					retry = config.retry;
					resolve(data);
				} else if (data.QueryExecution.Status.State === "FAILED") {
					reject(data.QueryExecution.Status.StateChangeReason);
				} 
			} catch (err) {
				if (isCommonAthenaError(err.code)) {
					retry = 2000;
				} else reject(err);
			}
		};
	});
}

function getQueryOutputFromS3(params) {
	const s3Params = {
			Bucket: params.s3Output.split("/")[2],
			Key: params.s3Output
				.split("/")
				.slice(3)
				.join("/")
		},
		input = params.config.s3.getObject(s3Params).createReadStream();
		return getJSONFromS3(input);
}

function getJSONFromS3(input) {
	let rawJson = [];
	return new Promise(function(resolve, reject) {
		readline
			.createInterface({ input })
			.on("line", line => {
				rawJson.push(line.trim());
			})
			.on("close", function() {
				resolve(rawJson);
			});
	});
}

function validateConstructor(init) {
	if (!init)
		throw new TypeError("Config object not present in the constructor");

	try {
		let aws = init.s3 ? init.s3 : init.aws.config.credentials.accessKeyId;
		let athena = new init.aws.Athena({ apiVersion: "2017-05-18" });
	} catch (e) {
		throw new TypeError(
			"AWS object not present or incorrect in the constructor"
		);
	}
}

function isCommonAthenaError(err) {
	return err === "TooManyRequestsException" ||
		err === "ThrottlingException" ||
		err === "NetworkingError" ||
		err === "UnknownEndpoint"
		? true
		: false;
}
