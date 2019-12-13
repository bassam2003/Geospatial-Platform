## How Geospatial-Platform is using SQL queries on Amazon Athena

Geospatial-Platform  bundles the following steps

1.	Initiates a query execution
2.	Keeps checking until the query has finished executing
3.	Fetches the results of the query execution from Amazon S3
4.	Formats the results into a clean, user-friendly JSON array
5.	Handles specific Athena errors `ThrottlingException`, `NetworkingError`, and `TooManyRequestsException`

## Instructions to run the app

 1. git clone https://github.com/bassam2003/Geospatial-Platform
 2. cd Geospatial-Platform
 3. npm instal
 4. npm start or npm test

### Prerequisites

-   You will need either an `IAM Role` (if you're running `Geospatial-Platform` on AWS Lambda or AWS EC2) **OR** an `IAM User` with `accessKeyId` and `secretAccessKey` (if you're running `Geospatial-Platform` on a standalone NodeJS application)
-   This IAM role/user must have `AmazonAthenaFullAccess` and `AmazonS3FullAccess` 

### Configuration
- `Geospatial-Platform` needs an AWS SDK object created with relevant permissions as mentioned in the prerequisites above.
- This AWS object is passed within the constructor so that it can invoke Amazon Athena SDK. 
 It creates an `aws` object by explicitly passing in the `accessKeyId` and `secretAccessKey` generated in prerequisites