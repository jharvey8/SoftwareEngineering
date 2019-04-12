$(document).ready(() => {
  // Message functions
  var msg = {
    showAlert: function(message) {
      $(".alert-message").text(message);
      $(".alert").slideDown();
    },

    showAffirmation: function(message) {
      $(".affirmation-message").text(message);
      $(".affirmation").slideDown();
    },

    closeAlert: function() {
      $(".alert-message").text("");
      $(".alert").slideUp();
    },

    closeAffirmation: function() {
      $(".affirmation-message").text("");
      $(".affirmation").slideUp();
    }
  }

  // User data & functions
  var user = {
      username: null,
      token: null,
      isLogged: false,

      loadFromCookie: function() {
        if (Cookies.get('username') && Cookies.get('token')) {
          this.username = Cookies.get('username');
          this.token = Cookies.get('token');
          this.isLogged = true;
          $(".login-name").text(this.username);
          $(".no-login").hide();
          $(".has-login").show();
        }
      },

      loadData: function(data) {
        this.username = data.username;
        this.token = data.token;
        this.isLogged = true;

        Cookies.set("username", this.username, { expires: 30 });
        Cookies.set("token", this.token, { expires: 30 });
      },

      handleServerErrors: function(response) {
        var msg_string = "";
        if (response.errors) {
          Object.keys(response.errors).forEach( (key, idx) => {
            msg_string += key + " " + response.errors[key] + ". ";
          });
        } else if (response.error) {
          msg_string = response.error.message;
        } else {
          msg_string = "Failed user operations. Try again.";
        }

        msg.showAlert(msg_string);
      },

      login: function(username, password) {
        $.post('apiV1/users/login', { username: username, password: password }, (data) => {
          if (data.error || data.errors) {
            this.handleServerErrors(data);
            return false;
          } else {
            this.loadData(data);

            msg.showAffirmation("Welcome back, " + this.username + "!");

            $(".login-name").text(this.username);
            $(".use-login").hide();
            $(".has-login").show();

            return true;
          }
        }).fail((data) => {
          var response = data.responseJSON;

          this.handleServerErrors(response);

          return false;
        });
      },

      logout: function() {
        this.username = null;
        this.token = null;
        this.isLogged = false;
        $(".login-name").text("");
        Cookies.remove('username');
        Cookies.remove('token');
      },

      create: function(username, password) {
        $.post('apiV1/users', { username: username, password: password }, (data) => {
          if (data.error || data.errors) {
            this.handleServerErrors(data);
            return false;
          } else {
            this.loadData(data);

            msg.showAffirmation("Welcome, " + this.username + "!");

            $(".login-name").text(this.username);
            $(".create-login").hide();
            $(".has-login").show();

            return true;
          }
        }).fail((data) => {
          var response = data.responseJSON;

          this.handleServerErrors(response);

          return false;
        });
      }

  };

  user.loadFromCookie();

  // Marker data and functions
  var markers = {
    collection: [],

    retrieve: function() {
      $.get("apiV1/markers/withusers", (data) => {
        if (!(data.error || data.errors)) {
          this.collection = data;
        } else {
          console.log("WARNING: Marker retrieval failure");
        }
      }).fail((data) => {
        console.log("WARNING: Marker retrieval failure");
      });
    },

    handleErrorsInModal: function() {

    },

    create: function(lat, long, name, desc) {
      $.post("apiV1/markers", {latitude: latitude, longitude: longitude, name: name, description: desc}, (data) => {
        if (data.error || data.errors) {
          this.handleErrorsInModal(data);
        }
      });
    }
  };

  markers.retrieve();

  // Input Handling
  $("#create-login-button").click((e) => {
    $(".no-login").hide();
    $(".create-login").show();
  });

  $("#use-login-button").click((e) => {
    $(".no-login").hide();
    $(".use-login").show();
  });

  $("#destroy-login-button").click((e) => {
    user.logout();
    $(".has-login").hide();
    $(".no-login").show();
  });

  $("#new-user-submit").click((e) => {
    e.preventDefault();
    var username = $("#new-user-username").val();
    var password = $("#new-user-password").val();
    user.create(username, password);
  });

  $("#new-user-cancel").click((e) => {
    $(".create-login").hide();
    $(".no-login").show();
  });

  $("#existing-user-submit").click((e) => {
    e.preventDefault();
    var username = $("#existing-user-username").val();
    var password = $("#existing-user-password").val();
    user.login(username, password);
  });

  $("#existing-user-cancel").click((e) => {
    $(".use-login").hide();
    $(".no-login").show();
  });

  $(".close-alert").click((e) => {
    msg.closeAlert();
  });

  $(".close-affirmation").click((e) => {
    msg.closeAffirmation();
  });

  $("#add-marker-button").click((e) => {
    if (user.isLogged){
      $("#newmarker").show();
    } else {
      msg.showAlert("You must be logged in to add a marker.");
    }
  });

  $(".cancelbtn").click((e) => {
    $("#newmarker").hide();
  });


});
