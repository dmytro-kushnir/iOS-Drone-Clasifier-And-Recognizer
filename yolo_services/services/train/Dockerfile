FROM nvidia/cuda:10.2-cudnn8-devel-ubuntu18.04
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update
RUN apt-get -y install nano sed wget git

#Installing OpenCV dependencies
RUN apt-get install -y build-essential cmake git pkg-config libgtk-3-dev \
    libavcodec-dev libavformat-dev libswscale-dev libv4l-dev \
    libxvidcore-dev libx264-dev libjpeg-dev libpng-dev libtiff-dev

#Getting OpenCV
RUN mkdir /opencv_build
WORKDIR  /opencv_build
RUN git clone https://github.com/opencv/opencv.git

#Compiling OpenCV
RUN mkdir /opencv_build/opencv/build
WORKDIR  /opencv_build/opencv/build
RUN cmake -D CMAKE_BUILD_TYPE=RELEASE \
    -D CMAKE_INSTALL_PREFIX=/usr/local \
    -D INSTALL_C_EXAMPLES=ON \
    -D INSTALL_PYTHON_EXAMPLES=ON \
    -D OPENCV_GENERATE_PKGCONFIG=ON \
    -D BUILD_EXAMPLES=ON ..

RUN make -j$(cat /proc/cpuinfo | grep processor | wc -l)
RUN make install

#Getting YOLOv4
WORKDIR  /
RUN git clone https://github.com/AlexeyAB/darknet.git
WORKDIR  /darknet
#Update Makefile
RUN sed -i '1 s/GPU=0/GPU=1/' Makefile
RUN sed -i '2 s/CUDNN=0/CUDNN=1/' Makefile
RUN sed -i '3 s/CUDNN_HALF=0/CUDNN_HALF=1/' Makefile
RUN sed -i '4 s/OPENCV=0/OPENCV=1/' Makefile

#Compiling Darknet
RUN make -j$(cat /proc/cpuinfo | grep processor | wc -l)

WORKDIR  /darknet
RUN wget https://github.com/AlexeyAB/darknet/releases/download/yolov4/yolov4-tiny.conv.29
RUN wget https://github.com/AlexeyAB/darknet/releases/download/yolov4/yolov4-tiny.weights