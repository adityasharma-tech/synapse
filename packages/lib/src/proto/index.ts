import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync(
    "/home/adityasharma/projects/synapse/proto/mail.proto"
);
const grpcObj = grpc.loadPackageDefinition(packageDef);
const mailPkg = grpcObj.mailPackage;

export { mailPkg };
