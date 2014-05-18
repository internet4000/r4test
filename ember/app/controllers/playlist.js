var PlaylistController = Ember.ObjectController.extend({
	// classNames: ['playlist'],
	// classNameBindings: ['isExpanded:playlist-expanded', 'isSingle:playlist-single'],
	needs: ['auth'],
	isEditing: false,
	isOwner: false,

	init: function () {
		this._super();
		this.authController = this.get('controllers.auth');
		// this.checkOwner();
	},

	actions: {
		editPlaylist: function() {
			this.set('isEditing', true);
		},
		saveEditing: function() {
			this.set('isEditing', false);
			this.get('playlist').save();
		},
		publishTrack: function(playlist, track) {
			if (!this.trackIsValid()) {
				Ember.debug('unvalid track');
				return; }

			Ember.debug('valid track');

			// Create a new track
			var track = this.get('store').createRecord('track', {
				url: this.get('trackUrl'),
				title: this.get('trackTitle'),
				body: this.get('trackBody'),
				created: new Date().getTime()
			});

			// Pass the action on to the playlist controller (see playlist.hbs)
			this.sendAction('onPublishTrack', this.get('playlist'), track);

			// Reset the fields
			this.setProperties({
				trackUrl: '',
				trackTitle: '',
				trackBody: ''
			});

			track.save().then(function() {
				Ember.RSVP.Promise.cast(playlist.get('tracks')).then(function(tracks) {
					tracks.addObject(track);
					playlist.save().then(function() {
						// success?
					}, function() {
						// error?
					});
				});
			});
		},
		removeTrack: function(track) {
			var playlist = this.get('playlist');
			Promise.cast(playlist.get('tracks')).then(function(tracks) {
				tracks.removeObject(track);
				track.destroyRecord();
				playlist.save();
			});
		}
	},

	checkOwner: function() {
		// var currentUserId = this.get('authController.currentUser.id');
		// var playlistUserId = this.get('model');

		// Ember.debug(currentUserId);
		// Ember.debug(playlistUserId);

		// if (currentUserId === playlistUserId) {
		// 	this.set('isOwner', true);
		// 	return true;
		// } else {
		// 	this.set('isOwner', false);
		// 	return false;
		// }
	},

	trackIsValid: function() {
		var isValid = true;
		['trackUrl'].forEach(function(field) {
			if (this.get(field) === '') {
				isValid = false;
			}
		}, this);
		return isValid;
	}
});

export default PlaylistController;
