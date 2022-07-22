<?php
// https://www.twilio.com/docs/video/javascript-getting-started
// 
// Set the Twilio helper library directory offset.
//  If in a subdirectory, use: '/twilio-php-master/Twilio/autoload.php'
require __DIR__ . '/../../twilio-php-main/src/Twilio/autoload.php';

use Twilio\Jwt\AccessToken;
use Twilio\Jwt\Grants\VideoGrant;

// Authentication values
$twilioAccountSid = getenv('MASTER_ACCOUNT_SID');           // starts with "AC".
$twilioApiKey = getenv('MASTER_API_KEY');             // starts with "SK".
$twilioApiSecret = getenv('MASTER_API_KEY_SECRET');

// A unique identifier for this user
// Sample program to generate a random identity: https://github.com/devinrader/twilio-video/blob/master/randos.php.
$identity = "dave" . rand(1, 1000);

// The specific Room we'll allow the user to access
$roomName = "door";
// Create access token, which we will serialize and send to the client
$token = new AccessToken($twilioAccountSid, $twilioApiKey, $twilioApiSecret, 3600, $identity);
$videoGrant = new VideoGrant();
$videoGrant->setRoom($roomName);
$token->addGrant($videoGrant);
// echo $token . "\xA";
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Twilio Video</title>
        <link rel="stylesheet" href="video.css">
        <script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
        <!-- script src="http://media.twiliocdn.com/sdk/js/video/releases/2.16.0/twilio-video.min.js"></script -->
        <!-- Recent release: https://github.com/twilio/twilio-video.js/releases -->
        <script src="//sdk.twilio.com/js/video/releases/2.22.0/twilio-video.min.js"></script>
        <script src="video.js"></script>
        <script type="text/javascript">
            // -----------------------------------------------------------------
            // code
            // -----------------------------------------------------------------
            var theToken = "<?php echo $token; ?>";
            var roomName = "<?php echo $roomName; ?>";
            var clientId = "<?php echo $identity; ?>";
            var identity = "<?php echo $identity; ?>";

            // -----------------------------------------------------------------
            function log(message) {
                var aTextarea = document.getElementById('logBox');
                aTextarea.value += "\n> " + message;
                aTextarea.scrollTop = aTextarea.scrollHeight;
            }
            function logger(message) {
                var aTextarea = document.getElementById('logBox');
                aTextarea.value += "\n> " + message;
                aTextarea.scrollTop = aTextarea.scrollHeight;
            }
            function clearTextAreas() {
                logBox.value = "+ Ready";
                logger("theToken: " + theToken);
                document.getElementById('remote-media-div').value = "okay0";
            }
        </script>
    </head>
    <body>
        <div id="controls">
            <div id="preview">
                <a href="https://github.com/tigerfarm/tfpvideo" style="text-decoration:none;">
                    <p class="instructions">Twilio Video GitHub Project</p>
                </a>
                <div id="local-media"></div>
                <button id="button-preview">Preview My Camera</button>
            </div>
            <div id="room-controls">
                <button id="button-join">Join Room</button>
                <button id="button-leave">Leave Room</button>
                <p>
                    <input type="text" id="clientid" name="clientid" placeholder="Enter participant id"/>
                    <input type="text" id="roomid" name="roomid" placeholder="Enter room name"/>
                </p>
                <p><button id="button-devices" onclick="listDevices();">List Devices</button></p>
            </div>
            <div id="log">
                <div class="panelTitle">
                    Log messages
                </div>
                <textarea id="logBox" style="height: 180px; width: 440px;"></textarea>
                <div class="panelArea">
                    <table>
                        <tr>
                            <td><button class="abutton" id="clearLog" onclick="clearTextAreas();">Clear</button></td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        <div id="remote-media-div">
            remote-media
        </div>
    </body>
</html>
