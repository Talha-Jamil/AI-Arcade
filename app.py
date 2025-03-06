from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/dino')
def dino():
    return render_template('dino.html')

if __name__ == '__main__':
    app.run(debug=True)
