#!/bin/make -f
# -*- makefile -*-
main_src ?= example/fade.js
iotjs_modules_dir ?= iotjs-modules

run/node: ${main_src} node_modules
	npm test

run/iotjs: ${main_src} ${iotjs_modules_dir}
	-which iotjs
	-iotjs -h 
	IOTJS_EXTRA_MODULE_PATH=${iotjs_modules_dir}/iotjs-wiringpi/lib/iotjs iotjs $<

run: run/node run/iotjs

iotjs_wiringpi_dir ?= ${iotjs_modules_dir}/iotjs-wiringpi
iotjs_wiringpi_url ?= https://github.com/rzr/iotjs-wiringpi
iotjs_wiringpi_branch ?= sandbox/rzr/master

${iotjs_modules_dir}/iotjs-wiringpi:
	mkdir -p $@
	git clone --depth 1 --recursive -b ${iotjs_wiringpi_branch} ${iotjs_wiringpi_url} $@

${iotjs_modules_dir}: ${iotjs_modules_dir}/iotjs-wiringpi
	du -ks $@

node_modules: package.json
	npm install
