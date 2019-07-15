#!/bin/make -f
# -*- makefile -*-

default: help start
	@echo "# $@: $^"

main_src ?= dist/example/fade.js
runtime ?= iotjs
project?=node-blinkt

iotjs_modules_dir ?= iotjs_modules
iotjs_wiringpi_dir ?= ${iotjs_modules_dir}/iotjs-wiringpi
iotjs_wiringpi_url ?= https://github.com/SamsungInternet/wiringpi-iotjs
iotjs_wiringpi_revision ?= v0.0.1

deploy_dir ?= ${CURDIR}/tmp/deploy
deploy_modules_dir ?= ${deploy_dir}/iotjs_modules
deploy_module_dir ?= ${deploy_modules_dir}/${project}
deploy_srcs += ${deploy_module_dir}/dist/*.js
deploy_srcs += ${deploy_module_dir}/dist/*/*.js
deploy_srcs += ${deploy_module_dir}/index.js

help:
	@echo "Usage:"
	@echo "# make start"

cleanall:
	rm -rf iotjs_modules node_modules

run/node: ${main_src} node_modules
	npm test

run/iotjs: ${main_src} ${iotjs_modules_dir}
	-which iotjs
	-iotjs -h 
	iotjs $<

run: run/node run/iotjs

${iotjs_modules_dir}/wiringpi-node:
	mkdir -p $@
	git clone --depth 1 --recursive -b ${iotjs_wiringpi_revision} ${iotjs_wiringpi_url} $@

${iotjs_modules_dir}: ${iotjs_modules_dir}/wiringpi-node
	du -ks $@

node_modules: package.json
	npm install --only=dev

${main_src}: package.json node_modules
	npm run build
	ls $@

start: run/${runtime}

${deploy_module_dir}/%: %
	@echo "# TODO: minify: $<"
	install -d ${@D}
	install $< $@

deploy: ${deploy_srcs}
	ls $<
