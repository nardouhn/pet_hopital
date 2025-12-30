from flask import jsonify

def success(data=None, message=None, status=200):
    payload = {}
    if message is not None:
        payload['message'] = message
    payload['data'] = data
    return jsonify(payload), status

def created(data=None, message='Created'):
    return success(data=data, message=message, status=201)

def error(message, status=400, errors=None):
    payload = {'message': message}
    if errors is not None:
        payload['errors'] = errors
    return jsonify(payload), status
