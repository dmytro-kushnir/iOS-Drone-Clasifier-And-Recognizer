import coremltools
from keras.models import model_from_json
import json

modelName = 'trained_3'

with open('%s.json' % modelName, 'r') as f:
    model_json  = f.read()
model = model_from_json(model_json)
print('model -> ', model)
model.load_weights('%s.h5' % modelName)

coreml_model = coremltools.converters.keras.convert(
    model,
    input_names='image',
    image_input_names='image',
    input_name_shape_dict={'image': [None, 416, 416, 3]},
    image_scale=1/255.)

coreml_model.license = 'Public Domain'
coreml_model.input_description['image'] = 'Input image'

coreml_model.save('yolo.mlmodel')