current_dir=$(pwd)

echo "Install deps"

# Match versions used by client/proto/generate.sh.
go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.36.6
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.6.1
go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway@v2.26.3
go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.26
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.1


echo "Generate client proto"
cd client/proto
protoc -I ./ ./daemon.proto  \
  --go_out=../  \
  --go-grpc_out=../  \
  --grpc-gateway_out=../  \
  --grpc-gateway_opt=generate_unbound_methods=true \
  --experimental_allow_proto3_optional 

cd "$current_dir"

# Match versions used by shared/management/proto/generate.sh and
# shared/signal/proto/generate.sh.
echo "Generate management proto"
cd shared/management/proto
protoc -I ./ ./management.proto --go_out=../ --go-grpc_out=../
protoc -I ./ ./proxy_service.proto --go_out=../ --go-grpc_out=../
cd "$current_dir"

echo "Generate signal proto"
cd shared/signal/proto
protoc -I ./ ./signalexchange.proto --go_out=../ --go-grpc_out=../
cd "$current_dir"
