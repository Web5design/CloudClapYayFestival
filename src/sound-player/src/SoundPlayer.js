define(
[
	'WAAX'
],
function (
	WX
){

	var SoundPlayer = function(socketio) {
		var self = this,
		uuid,
		listens = ['clap', 'wow', 'booh'],
		reports = [],
		socket,
		currentSampler,
		sounds;

		var init = function () {
			sounds = [];

			for (var i = 0; i < 20; i++) {
				var sound = {};
				sound.sampler = new WX.Sampler({ source:"audio/clap.mp3" });
				sound.comp = new WX.Comp({ threshold:-9.0, ratio:8.0, gain:10.0 });
				sound.verb = new WX.ConVerb({source:"audio/ir/960-BigEmptyChurch.wav", mix:0.1 });
				WX.link(sound.sampler, sound.verb,  WX.DAC);
				sounds.push(sound);
			};
			currentSampler = 0;
			
		}

		var connect = function (host) {
			socket = socketio.connect(host);
			socket.on('error', function () {
				setTimeout(function () {
					socket.socket.connect();
				}, 1000);
			});

			socket.on('connect', onConnect);
			socket.on('login', onLogin);
			socket.on('clap', clap);
			socket.on('wow', wow);
			socket.on('booh', booh);
		}		
		var clap = function () {
			console.log('Clap');
			sounds[currentSampler].verb.mix = 0.05 + Math.random() * 0.1;
			sounds[currentSampler].sampler.gain =  Math.pow((Math.random()>0.8) ? 2 : 0.5, Math.random()) - 1;
			sounds[currentSampler].sampler.noteOn(Math.random() * 7 + 57);
			currentSampler++;
			if(currentSampler == sounds.length) currentSampler = 0;
		}
		var wow = function () {
			console.log('Wow');
		}
		var booh = function () {
			console.log('Booh');
		}

		var onConnect = function () {
			socket.emit('identity', {
				uuid: localStorage.getItem('player_uuid'),
				listens: listens,
				reports: reports
			});
		}
		var onLogin = function(_uuid){
			uuid = _uuid;
			localStorage.setItem('player_uuid', uuid)
			console.log('Login', uuid);
		}
		

		Object.defineProperty(self, 'connect', {
			value: connect
		});
		Object.defineProperty(self, 'clap', {
			value: clap
		});
		Object.defineProperty(self, 'wow', {
			value: wow
		});
		Object.defineProperty(self, 'booh', {
			value: booh
		});

		init();
	}
	return SoundPlayer;
});