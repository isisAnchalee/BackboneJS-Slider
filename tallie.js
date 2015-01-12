

// app namespace setup
TallieSlideshow = {
    Views: {},
    Models: {},
    Collections: {}
};

// configuration for underscores template syntax
_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

// setting up slide model
TallieSlideshow.Models.Slide = Backbone.Model.extend({
    defaults: {
        id: null,
        Title: 'Meow!',
        Url: 'http://placekitten.com.s3.amazonaws.com/homepage-samples/408/287.jpg',
        layout: 'right'
    },

    show: function() {
        this.getEl().show();
    },

    getEl: function() {
        return $('#slide-' + this.id);
    },

    getControl: function() {
        return $('.jump-to').eq(this.id - 1);
    }
});

// create collection of slides
TallieSlideshow.Collections.Slides = Backbone.Collection.extend({
    model: TallieSlideshow.Models.Slide
});

// creates slide view that takes in slide collection handles various events
TallieSlideshow.Views.Slideshow = Backbone.View.extend({

    events: {
        'click .toggle-play-pause': 'togglePlayPause',
        'click .jump-to': 'jumpTo',
        'click #back-btn': 'rotateSlidesBackwards',
        'click #next-btn': 'rotateSlidesForward'
    },

    el: '#slideshow',
    slides: '#slideshow .slides',
    controls: '#slideshow .controls',
    playPauseControl: '#slideshow .controls .toggle-play-pause',
    interval: 10000,
    currentIndex: 0,

    slideTemplate: _.template('<li id="slide-{{ id }}" class="slide {{ layout }}">' + '<div class="Title">{{ Title }}<br> </div> <div class="image-wrapper"> <img class="slide-img" src="{{ Url }}"> </div>' + '</li>'),

    controlTemplate: _.template('<li class="slide-control jump-to" data-index="{{ index }}">{{ human_readable_index }}</li>'),

    initialize: function() {
        _.bindAll(this, 'render', 'rotateSlidesForward','rotateSlidesBackwards', 'togglePlayPause', 'play', 'pause', 'initialPlay', 'transition', 'jumpTo');
    },

    render: function() {
        var self = this;
        this.collection.each(function(slide, i) {
            $(self.slides).append(self.slideTemplate(slide.toJSON()));
            $(self.controls).append(self.controlTemplate({
                index: i,
                human_readable_index: ++i
            }));
        });
        this.initialPlay();
        return this;
    },

    rotateSlidesForward: function() {
        var current = this.currentIndex;
        var next = this.currentIndex === (this.collection.length - 1) ? 0 : this.currentIndex + 1;
        this.transition(current, next);
    },
    
    rotateSlidesBackwards: function() {
        var current = this.currentIndex;
        var next = this.currentIndex === 0 ? (this.collection.length - 1) : this.currentIndex - 1;
        this.transition(current, next);
    },

    transition: function(from, to) {
        var current = this.collection.at(from);
        var next = this.collection.at(to);
        current.getEl().addClass('')


        current.getEl().fadeOut('slow', function() {
            next.getEl().fadeIn('slow');
        });
        current.getControl().toggleClass('current');
        next.getControl().toggleClass('current');
        this.currentIndex = to;
    },

    togglePlayPause: function() {
        if (this.isPlaying()) {
            this.pause();
        } else {
            this.play();
        }
    },

    initialPlay: function() {
        this.collection.at(0).show();
        this.collection.at(0).getControl().toggleClass('current');
        this.play();
    },

    pause: function() {
        if (this.isPaused()) {
            return;
        }
        $('.icon').html("&#9658;");

        this.state = 'paused';
        clearInterval(this.intervalID);
        $(this.playPauseControl).toggleClass('playing', false);
    },

    play: function() {
        if (this.isPlaying()) {
            return;
        }

        $('.icon').html("&#10074;&#10074;");
        this.state = 'playing';
        this.intervalID = setInterval(this.rotateSlidesForward, this.interval);
        $(this.playPauseControl).toggleClass('playing', true);
    },

    jumpTo: function(e) {
        var next = $(e.currentTarget).data('index');
        this.pause();
        this.transition(this.currentIndex, next);
    },

    isPlaying: function() {
        return this.state === 'playing';
    },

    isPaused: function() {
        return !this.isPlaying();
    }

});

//slide data
TallieSlideshow.SliderData = {
  "Images": [
    {
      "Title": "Drag & Drop a Receipt",
      "Url": "http://support.usetallie.com/customer/portal/attachments/363862",
      "id": 1
}, {  "Title": "Import CC Transactions",
      "Url": "http://support.usetallie.com/customer/portal/attachments/136674",
      "id": 2
    },
    {
      "Title": "Email Receipts",
      "Url": "http://support.usetallie.com/customer/portal/attachments/385960",
      "id": 3

}, { "Title": "Automatic Expense Reports",
      "Url": "http://support.usetallie.com/customer/portal/attachments/385993",
      "id": 4
    },
    {
      "Title": "Approve Expense Reports via Email",
      "Url": "http://support.usetallie.com/customer/portal/attachments/238759",
      "id": 5
}, { "Title": "Export to Quickbooks Online",
      "Url": "http://support.usetallie.com/customer/portal/attachments/314630",
      "id": 6
    }
] };

//generates collection using slide data
TallieSlideshow.SliderCollection =  new TallieSlideshow.Collections.Slides(TallieSlideshow.SliderData["Images"], { view: this });

// creates an instance of our slideshow, passes in a new collection of slides
TallieSlideshow.Slideshow = new TallieSlideshow.Views.Slideshow({
    collection: TallieSlideshow.SliderCollection
}).render();

