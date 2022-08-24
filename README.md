docker buildx build --platform linux/arm64,linux/amd64 -t p3000/bibler-ui . --push

docker run -it --rm --name bibler-ui -p 4200:4200 p3000/bibler-ui
