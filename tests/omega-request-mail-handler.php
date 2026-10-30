<?php
define('ABSPATH', __DIR__.'/../'); define('MINUTE_IN_SECONDS',60);define('HOUR_IN_SECONDS',3600);
define('OMEGA_REQUEST_CONFIG',sys_get_temp_dir().'/omega-mail-test-'.getmypid().'.php');
file_put_contents(OMEGA_REQUEST_CONFIG, "<?php return ['enabled'=>true,'password'=>'test-only'];");
$GLOBALS['db']=[];$GLOBALS['rates']=[];$GLOBALS['actions']=[];$GLOBALS['calls']=0;$GLOBALS['mail_result']=true;
function add_action($tag,$fn,$priority=10){$GLOBALS['actions'][$tag][$priority]=$fn;}function remove_action($tag,$fn,$priority=10){unset($GLOBALS['actions'][$tag][$priority]);}function add_filter(...$a){}
function wp_parse_url($u){return parse_url($u);}function home_url($p='/'){return 'https://example.test'.$p;}function is_ssl(){return true;}function omega_theme_consent_version(){return 'v1';}
function wp_json_encode($v){return json_encode($v,JSON_UNESCAPED_UNICODE);}function wp_salt($x){return 'testing-salt-'.$x;}
function get_option($k){return $GLOBALS['db'][$k]??false;}function add_option($k,$v,...$unused){if(isset($GLOBALS['db'][$k]))return false;$GLOBALS['db'][$k]=$v;return true;}function update_option($k,$v,...$unused){$GLOBALS['db'][$k]=$v;}function delete_option($k){unset($GLOBALS['db'][$k]);}
function get_transient($k){return $GLOBALS['rates'][$k]??false;}function set_transient($k,$v,$t){$GLOBALS['rates'][$k]=$v;}function wp_schedule_single_event(...$a){}
class WP_REST_Request {private $body;function __construct($data){$this->body=json_encode($data);}function get_header($name){return 'application/json';}function get_body(){return $this->body;}function get_json_params(){return json_decode($this->body,true);}}
class WP_REST_Response {public $data;public $status;function __construct($d,$s){$this->data=$d;$this->status=$s;}function header($a,$b){}}
class FakeMailer {public $Host,$Port,$SMTPSecure,$SMTPAuth,$Username,$Password,$Timeout,$SMTPDebug,$from;function isSMTP(){}function setFrom($address,$name,$auto){$this->from=$address;}}
function wp_mail($to,$subject,$body,$headers){$GLOBALS['calls']++;$m=new FakeMailer();$GLOBALS['actions']['phpmailer_init'][PHP_INT_MAX]($m);if($m->Host!=='smtp.mail.ru'||$m->Port!==465||$m->Password!=='test-only'||$m->from!=='omegakomplekt@mail.ru'||$to!=='omegakomplekt@mail.ru')throw new Exception('smtp configuration mismatch');return $GLOBALS['mail_result'];}
function check($ok,$message){if(!$ok){fwrite(STDERR,"FAIL: $message\n");exit(1);}}
require __DIR__.'/../wordpress/plugins/omega-request-mail/omega-request-mail.php';
$_SERVER['HTTP_ORIGIN']='https://example.test';$_SERVER['REMOTE_ADDR']='192.0.2.1';
$d=['parameters'=>'Тест','email'=>'client@example.com','phone'=>'+7 (917) 201-21-00','name'=>'Тест','consent'=>true,'website'=>'','requestId'=>'24d3cad1-a9d1-4470-817a-c820331b714a','consentVersion'=>'v1'];
$r=omega_request_send(new WP_REST_Request($d));check($r->status===200 && $r->data['status']==='accepted' && $GLOBALS['calls']===1,'valid request delivered once');
$r=omega_request_send(new WP_REST_Request($d));check($r->status===200 && $GLOBALS['calls']===1,'duplicate does not resend');
$changed=$d;$changed['parameters']='changed';$r=omega_request_send(new WP_REST_Request($changed));check($r->status===409 && $GLOBALS['calls']===1,'conflicting duplicate');
$d['requestId']='34d3cad1-a9d1-4470-817a-c820331b714a';$GLOBALS['mail_result']=false;$r=omega_request_send(new WP_REST_Request($d));check($r->status===502 && $r->data['code']==='delivery_unconfirmed','smtp failure is not success');$r=omega_request_send(new WP_REST_Request($d));check($r->status===409 && $GLOBALS['calls']===2,'failed delivery is not silently resent');
$_SERVER['HTTP_ORIGIN']='https://evil.example';$r=omega_request_send(new WP_REST_Request($d));check($r->status===403 && $GLOBALS['calls']===2,'foreign origin blocked');
$_SERVER['HTTP_ORIGIN']='https://evil@example.test';check(!omega_request_origin_allowed(),'userinfo origin rejected');
$_SERVER['HTTP_ORIGIN']='https://example.test';$d['requestId']='44d3cad1-a9d1-4470-817a-c820331b714a';$d['consent']=false;$r=omega_request_send(new WP_REST_Request($d));check($r->status===422 && $GLOBALS['calls']===2,'consent rejected without mail');
$d['consent']=true;$rate='omega_rate_'.substr(hash_hmac('sha256',$_SERVER['REMOTE_ADDR'],wp_salt('nonce')),0,32);$GLOBALS['rates'][$rate]=5;$r=omega_request_send(new WP_REST_Request($d));check($r->status===429 && $GLOBALS['calls']===2,'rate limit rejects request before mail');
unset($GLOBALS['rates'][$rate]);unlink(OMEGA_REQUEST_CONFIG);$r=omega_request_send(new WP_REST_Request($d));check($r->status===503 && $GLOBALS['calls']===2,'missing configuration fails closed');
unset($GLOBALS['db'],$GLOBALS['rates']);@unlink(OMEGA_REQUEST_CONFIG);
echo "PASS: request route, fixed recipient, SMTP configuration, origin, consent, idempotency and failure. No mail sent.\n";
