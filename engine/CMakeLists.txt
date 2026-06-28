cmake_minimum_required(VERSION 3.16)
project(SchedulerEngine CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# On macOS, find OpenSSL if available (httplib can use it)
find_package(OpenSSL QUIET)

add_executable(scheduler_engine
    src/main.cpp
)

target_include_directories(scheduler_engine PRIVATE
    src
    vendor
)

# Link threads (required by httplib)
find_package(Threads REQUIRED)
target_link_libraries(scheduler_engine PRIVATE Threads::Threads)

if(OpenSSL_FOUND)
    target_link_libraries(scheduler_engine PRIVATE OpenSSL::SSL OpenSSL::Crypto)
    target_compile_definitions(scheduler_engine PRIVATE CPPHTTPLIB_OPENSSL_SUPPORT)
endif()

# Optimization flags
target_compile_options(scheduler_engine PRIVATE -O2 -Wall -Wextra)
