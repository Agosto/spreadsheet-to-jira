import logging
import os
import traceback
from datetime import datetime, timedelta

from flask import Flask, request, jsonify, render_template, send_from_directory
from tzlocal import get_localzone

from forked_jira import JIRA
from forked_jira.exceptions import JIRAError

WEBAPP = 'webapp'
static_path = os.path.join(os.getcwd(), WEBAPP) + '/build/static/'

app = Flask(__name__, template_folder=WEBAPP, static_folder="/" + WEBAPP)


@app.route('/static/<path:filename>')
def serve_static_files(filename):
    return send_from_directory(static_path, filename)


@app.route('/')
def index():
    return render_template('build/index.html')


@app.route('/proxy', methods=["POST"])
def proxy():
    request_json = dict(request.json)
    tz = get_localzone()
    selected_instance = request_json.get('selectedInstance')

    try:
        jira = JIRA(selected_instance, basic_auth=(request_json["username"], request_json["password"]))
    # basic_auth failure
    except JIRAError:
        traceback.print_exc()
        print("oAuth failed")
        return jsonify(error=True, message="email and/or password is wrong"), 403

    else:
        entry = request_json.get("entry")

        if entry:
            try:
                print(entry)
                started = entry[0]
                issue = entry[1]
                time_spent = entry[2]
                comment = entry[3]
                index = entry[4]
            except:
                return jsonify(error=True, message="Something went wrong :("), 500

            try:
                time_spent = float(time_spent)
                time_spent = str(time_spent) + 'h'  # default is hour
            except ValueError:
                # If its not typcastable to float, we can just pass since it probably has an 'm' / 'h' suffix, which is the format JIRA already needs
                pass

            try:
                offset_started = datetime.strptime(started, "%m-%d-%Y") + timedelta(hours=9)
                localized_started = tz.localize(offset_started)

            except ValueError:
                return jsonify(
                    error=True,
                    message="Failed at line #{} because date does not appear to be valid.".format(str(index + 1))
                ), 400

            try:
                worklog = jira.add_worklog(
                    issue,
                    timeSpent=time_spent,
                    comment=comment,
                    started=localized_started
                )
                # logging module doesn't work
                print("Submitted worklog: {}".format(worklog))

            except JIRAError as e:
                # logging module doesn't work
                print(e)
                return jsonify(
                    error=True,
                    message="Failed at line #{} beacuse error: {}".format((str(index + 1), issue))
                ), 400

            return jsonify(success=True, worklog_id=str(worklog))

        else:
            return jsonify(error=True, message="entry was invalid"), 400


@app.errorhandler(500)
def server_error(e):
    logging.exception('An error occurred during a request.')
    return """
    An internal error occurred: <pre>{}</pre>
    See logs for full stacktrace.
    """.format(e), 500


if __name__ == '__main__':
    # Gunicorn is used to run the application on Google App Engine. See app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
