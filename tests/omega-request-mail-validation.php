<?php
define('ABSPATH', __DIR__ . '/../');
function add_action(...$args) {}
function add_filter(...$args) {}
$plugin=__DIR__.'/../wordpress/plugins/omega-request-mail/omega-request-mail.php';
if (!is_file($plugin)) {fwrite(STDERR,"FAIL: WordPress request handler does not exist yet.\n");exit(1);}
require $plugin;
function expect($condition,$message) {if (!$condition) {fwrite(STDERR,"FAIL: ".$message."\n");exit(1);}}
$good=['parameters'=>'Тестовый запрос','email'=>'client@example.com','phone'=>'+7 (917) 201-21-00','name'=>'Тест','consent'=>true,'website'=>'','requestId'=>'24d3cad1-a9d1-4470-817a-c820331b714a','consentVersion'=>'v1'];
$r=omega_request_validate($good,'v1');expect($r['ok']===true,'valid request');expect($r['data']['phone']==='+79172012100','normalized phone');expect($r['data']['parameters']==='Тестовый запрос','Unicode content');
foreach (['parameters','email','phone','consent','requestId','consentVersion'] as $key) {$bad=$good;unset($bad[$key]);$r=omega_request_validate($bad,'v1');expect($r['ok']===false,'required '.$key);}
$bad=$good;$bad['email']="test@example.com\r\nBcc:other@example.com";expect(!omega_request_validate($bad,'v1')['ok'],'reject injected header');
$bad=$good;$bad['website']='spam';expect(!omega_request_validate($bad,'v1')['ok'],'honeypot');
$bad=$good;$bad['requestId']='bad';expect(!omega_request_validate($bad,'v1')['ok'],'UUID validation');
$bad=$good;$bad['consentVersion']='old';expect(!omega_request_validate($bad,'v1')['ok'],'consent version');
$bad=$good;$bad['parameters']=str_repeat('x',3001);expect(!omega_request_validate($bad,'v1')['ok'],'parameter limit');
$bad=$good;$bad['phone']='123';expect(!omega_request_validate($bad,'v1')['ok'],'phone validation');
$bad=$good;$bad['consent']='true';expect(!omega_request_validate($bad,'v1')['ok'],'explicit consent');
echo "PASS: WordPress request validation, consent, honeypot, injection, bounds and UUID.\n";
