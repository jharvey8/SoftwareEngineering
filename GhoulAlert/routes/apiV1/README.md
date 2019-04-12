# API Documentation

The API (Application Programming Interface) is the backbone of this application.
It manages the current models (as of now, the Users and Markers), and it handles
authorization for various features.

When specific requests in the proper format are made to the API routes, the
application responds with JSON-formatted data. In addition to allowing the application
to "speak" with itself, this also allows other applications to receive some of this
application's data for their own use.

# Authorization

Some routes will be marked with **Authorization: Required**. This means that a
special token assigned to identify users is necessary in requests, or the application will
respond only with a 401 HTTP code.

This token is received when a new user is created, when a user refreshes their
token through the user login route, or when a user checks their own status with the
current user route. Tokens will be valid for 30 days from when they are created/refreshed.

This token should be attached to a header named **Authorization**,
in the format **Token [token here]**.

# Paths

## Users

These are the registered users of our application. Users only need to register to
create, edit, and delete markers; simply viewing markers is accessible to anyone.

### Create User

`POST apiV1/users`

**Authorization: Optional**

Makes a new user with the provided username and password, and responds with a token
to be used for authorization.

#### Expected Request Format

```
{
	"username": "[username{string}]",
	"password": "[password{string}]"
}
```

* **username:** The user's username
* **password:** The password that this user will use to confirm their identity

#### Expected Response

```
{
  "id": [id{integer}],
  "username": [username{string}],
  "token": [token{string}]
}
```

* **id:** The ID number of the user as they are identified in the database
* **username:** The user's username
* **token:** The token that identifies the user in requests requiring authorization

#### Constraints and Error Handling

* Responds with an error when username or password is not provided
* Responds with a validation error if username is not unique (user with that username already exists)

### User Login

`POST apiV1/users/login`

**Authorization: Optional**

Refreshes and responds with a new identifying token for the user with the provided
username and password.

#### Expected Request Format

```
{
	"username": "[username{string}]",
	"password": "[password{string}]"
}
```

* **username:** The user's username
* **password:** The password that this user will use to confirm their identity

#### Expected Response

```
{
  "id": [id{integer}],
  "username": [username{string}],
  "token": [token{string}]
}
```

* **id:** The ID number of the user as they are identified in the database
* **username:** The user's username
* **token:** The token that identifies the user in requests requiring authorization

#### Constraints and Error Handling

* Responds with an error when username or password is not provided
* Responds with an error if no user exists with given username
* Responds with an error if the given password for the given user is wrong

### Current User

`GET apiV1/users/current`

**Authorization: Required**

Responds with data for the current user based on the provided authentication token.

#### Expected Request Format

No request body

#### Expected Response

```
{
  "id": [id{integer}],
  "username": [username{string}],
  "token": [token{string}]
}
```

* **id:** The ID number of the user as they are identified in the database
* **username:** The user's username
* **token:** The token that identifies the user in requests requiring authorization

#### Constraints and Error Handling

* Responds with an error if there is no authentication token
* Responds with an error if the authentication token does not map to a user

## Markers

These represent points on the Google Map that users can set. The database stores relevant
information in these objects and sends it to the map service to be processed onto the map.

### All Markers

`GET apiV1/markers`

**Authorization: Optional**

Responds with an array containing all stored markers.

#### Expected Request Format

No request body

#### Expected Response

```
[
  {
    "id": [id{integer}],
    "latitude": [latitude{float}],
    "longitude": [longitude{float}],
    "name": [name{string}],
    "description": [description{string}],
    "UserId": [ID of owner{integer}]
  },
  ...
]
```

* **id:** The ID number of this marker as it is identified in the database
* **latitude:** The latitude value of the marker
* **longitude:** The longitude value of the marker
* **name:** The name for the marker
* **description:** A description for the marker
* **UserId:** The ID number of the user that created this marker

#### Constraints and Error Handling

N/A

### All Markers (And User Data)

`GET apiV1/markers/withusers`

**Authorization: Optional**

Similar to the above, but includes user data (primarily the username of the owner)

#### Expected Request Format

No request body

#### Expected Response

```
[
  {
    "id": [id{integer}],
    "latitude": [latitude{float}],
    "longitude": [longitude{float}],
    "name": [name{string}],
    "description": [description{string}],
    "User": {
      "id": [ID of owner{integer}],
      "username": [user username{string}]
    }
  },
  ...
]
```

* **id:** The ID number of this marker as it is identified in the database
* **latitude:** The latitude value of the marker
* **longitude:** The longitude value of the marker
* **name:** The name for the marker
* **description:** A description for the marker
* **User:** The user that owns this marker
* **User.id** The ID number of the user that created this marker
* **User.username** The username of the user that created this marker

#### Constraints and Error Handling

N/A

### Get One Marker

`GET apiV1/markers/:id`

**Where :id = ID of the marker**

**Authorization: Optional**

Obtains the data for one marker by its ID

#### Expected Request Format

No request body

#### Expected Response

```
{
  "id": [id{integer}],
  "latitude": [latitude{float}],
  "longitude": [longitude{float}],
  "name": [name{string}],
  "description": [description{string}],
  "UserId": [ID of owner{integer}]
}
```

* **id:** The ID number of this marker as it is identified in the database
* **latitude:** The latitude value of the marker
* **longitude:** The longitude value of the marker
* **name:** The name for the marker
* **description:** A description for the marker
* **UserId** The ID number of the user that created this marker

#### Constraints and Error Handling

* Responds with a 404 error if there is no marker with the given id

### Get One Marker (And User Data)

`GET apiV1/markers/:id/withuser`

**Where :id = ID of the marker**

**Authorization: Optional**

Same as above, but includes user data such as their username

#### Expected Request Format

No request body

#### Expected Response

```
{
  "id": [id{integer}],
  "latitude": [latitude{float}],
  "longitude": [longitude{float}],
  "name": [name{string}],
  "description": [description{string}],
  "User": {
    "id": [ID of owner{integer}],
    "username": [user username{string}]
  }
}
```

* **id:** The ID number of this marker as it is identified in the database
* **latitude:** The latitude value of the marker
* **longitude:** The longitude value of the marker
* **name:** The name for the marker
* **description:** A description for the marker
* **User:** The user that owns this marker
* **User.id** The ID number of the user that created this marker
* **User.username** The username of the user that created this marker

#### Constraints and Error Handling

* Responds with a 404 error if there is no marker with the given id

### Create a Marker

`POST apiV1/markers`

**Authorization: Required**

Creates a new marker with the given parameters, owned by the user that owns the
provided authorization token.

#### Expected Request Format

```
{
  "latitude": [latitude{float}],
  "longitude": [longitude{float}],
  "name": [name{string}],
  "description": [description{string}] <optional>,
}
```

* **latitude:** The latitude value of the marker
* **longitude:** The longitude value of the marker
* **name:** The name for the marker
* **description:** A description for the marker (optional)

#### Expected Response

##### Success Case

```
{
  "success": true,
  "marker": {
    "id": [id{integer}],
    "latitude": [latitude{float}],
    "longitude": [longitude{float}],
    "name": [name{string}],
    "description": [description{string/null}],
    "UserId": [Owner's id{integer}],
    "updatedAt": [Update date{date}],
    "createdAt": [Creation date{date}]
  }
}
```
* **success:** Whether or not creation succeeded
* **marker.id:** The ID number of this marker as it is identified in the database
* **marker.latitude:** The latitude value of the marker
* **marker.longitude:** The longitude value of the marker
* **marker.name:** The name for the marker
* **marker.description:** A description for the marker
* **marker.UserId** The ID number of the user that created this marker
* **marker.updatedAt** The date this object was last updated
* **marker.createdAt** The date this object was first created

##### Failure Case

This occurs if the error is validation based

```
{
  "success": false,
  "error": {
    "message": [Error message{string}]
  }
}
```
* **success:** Whether or not creation succeeded
* **error.message:** A description of the error that has occurred

#### Constraints and Error Handling

* Responds with an error if marker latitude, longitude, or name are not provided
* Responds with an error if there is no authorization token
* Responds with an error if the authorization token does not match a user
* Responds with an error if the name of the marker is not unique

### Edit a Marker

`PUT apiV1/markers/:id`

**Where :id = ID of marker to edit**

**Authorization: Required**

Edits the marker with the provided ID, but only if the authorized user owns it.

#### Expected Request Format

The format is flexible; you only need to provide the properties that will be changed.

```
{
  "latitude": [latitude{float}] <optional>,
  "longitude": [longitude{float}] <optional>,
  "name": [name{string}] <optional>,
  "description": [description{string}] <optional>,
}
```

* **latitude:** The latitude value of the marker
* **longitude:** The longitude value of the marker
* **name:** The name for the marker
* **description:** A description for the marker

#### Expected Response

##### Success Case

```
{
  "success": true,
  "editedFrom": {
    "id": [id{integer}],
    "latitude": [latitude{float}],
    "longitude": [longitude{float}],
    "name": [name{string}],
    "description": [description{string/null}],
    "UserId": [Owner's id{integer}],
    "updatedAt": [Update date{date}],
    "createdAt": [Creation date{date}]
  },
  "editedTo": {
    "id": [id{integer}],
    "latitude": [latitude{float}],
    "longitude": [longitude{float}],
    "name": [name{string}],
    "description": [description{string/null}],
    "UserId": [Owner's id{integer}],
    "updatedAt": [Update date{date}],
    "createdAt": [Creation date{date}]
  }
}
```

* **success:** Whether or not editing succeeded
* **editedFrom:** The state of the marker before it was edited
* **editedTo:** The state of the marker after being edited

##### Failure Case

This occurs if the error is validation based

```
{
  "success": false,
  "error": {
    "message": [Error message{string}]
  }
}
```
* **success:** Whether or not editing succeeded
* **error.message:** A description of the error that has occurred

#### Constraints and Error Handling

* Responds with an error if there is no authentication token
* Responds with an error if the authentication token does not match to a user
* Responds with an error if there is no marker with the given id
* Responds with an error if the user does not own the marker
* Responds with an error if the name is edited to one that already exists in the database

### Delete a Marker

`DELETE apiV1/markers/:id`

**Where :id = The ID of the marker to be deleted**

**Authorization: Required**

If the authorized user owns the specified marker, it will be deleted

#### Expected Request Format

No request body

#### Expected Response

##### Success Case

```
{
  "success": true,
  "deleted": {
    "id": [id{integer}],
    "latitude": [latitude{float}],
    "longitude": [longitude{float}],
    "name": [name{string}],
    "description": [description{string/null}],
    "UserId": [Owner's id{integer}],
    "updatedAt": [Update date{date}],
    "createdAt": [Creation date{date}]
  }
}
```

* **success:** Whether or not deletion succeeded
* **deleted:** The object that was deleted
* **deleted.id:** The ID number of this marker as it is identified in the database
* **deleted.latitude:** The latitude value of the marker
* **deleted.longitude:** The longitude value of the marker
* **deleted.name:** The name for the marker
* **deleted.description:** A description for the marker
* **deleted.UserId** The ID number of the user that created this marker
* **deleted.updatedAt** The date this object was last updated
* **deleted.createdAt** The date this object was first created

##### Failure Case

This occurs if the error is validation based

```
{
  "success": false,
  "error": {
    "message": [Error message{string}]
  }
}
```
* **success:** Whether or not deletion succeeded
* **error.message:** A description of the error that has occurred

#### Constraints and Error Handling

* Responds with an error if there is no authentication token
* Responds with an error if the authentication token does not match to a user
* Responds with an error if there is no marker with the given id
* Responds with an error if the user does not own the marker
