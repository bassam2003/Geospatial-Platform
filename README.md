### Geospatial-Platform code performs the following steps 

1.	Initiates a query execution.
2.	Checks if the query has finished executing
3.	Fetches the results of the query from Amazon S3
4.	Formats the results into a JSON array
5. Handles specific testing errors 'export AthenaExpress constructor', and 'Negative Scenarios'
6.	Handles specific Athena express errors `ThrottlingException`, `NetworkingError`, and `TooManyRequestsException`

### Instructions to run the code

 1. git clone https://github.com/bassam2003/Geospatial-Platform
 2. cd Geospatial-Platform
 3. npm instal
 4. npm start or npm test

### Prerequisites

-  You will need an 'IAM Role' If you're running the App on AWS Lambda.
-  You will need an 'IAM User' with 'accessKeyId' and 'secretAccessKey' if you're running the App` on a standalone NodeJS application.
-  The IAM role/user must have 'AmazonAthenaFullAccess' and 'AmazonS3FullAccess'. 

### Configuration
- You need AWS SDK object created with relevant permissions.
- The AWS SDK object is passed within the constructor to invoke Amazon Athena SDK.
