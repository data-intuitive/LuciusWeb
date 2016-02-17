name := "Interface"

resolvers += "Job Server Bintray" at "https://dl.bintray.com/spark-jobserver/maven"

libraryDependencies += "spark.jobserver" % "job-server-api" % "0.5.0" % "provided"

libraryDependencies += "org.apache.spark" %% "spark-core" % "1.2.0"

