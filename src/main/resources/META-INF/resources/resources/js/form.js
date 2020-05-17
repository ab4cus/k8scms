(function () {
    const Constructor = function () {

        const create = function (model, inputData) {
            let form;

            let contentE = $('<form>').addClass('mdl-grid');
            let inputs = {};
            for (let i in model.fields) {
                // skip oids (ids CAN me edited)
                let field = model.fields[i];
                let input;
                switch (field.type) {
                    case '$oid' :
                        input = createTextInput(model, field);
                        input.inputE.prop('disabled', true);
                        break;
                    case '$date':
                        input = createTextInput(model, field);
                        break;
                    case 'json':
                        input = createJsonInput(model, field);
                        break;
                    case 'number':
                    case 'decimal':
                        input = createNumberInput(model, field);
                        break;
                    case 'boolean':
                        input = createSwitchInput(model, field);
                        break;
                    case 'secret1':
                        input = createTextInput(model, field);
                        input.inputE.attr('type', 'password')
                        break;
                    case 'secret2':
                        input = createTextInput(model, field);
                        break;
                    default:
                        input = createTextInput(model, field);
                }
                inputs[field.name] = input;
                input.labelE.append($.cms.utils.getFieldIcon(field))
                input.divE
                    .addClass('cms-form-input')
                    .addClass('mdl-cell mdl-cell--12-col')
                    .appendTo(contentE);
            }

            const getValues = function () {
                let data = {};
                for (let field of model.fields) {
                    let value = inputs[field.name].getValue();
                    if (value != null) {
                        data[field.name] = value;
                    }
                }
                return data;
            }

            const setValues = function (values) {
                for (let field of model.fields) {
                    inputs[field.name].setValue(values[field.name]);
                }
            }

            const reset = function () {
                setValues(inputData);
            }

            if (inputData) {
                setValues(inputData);
            }

            form = {
                contentE: contentE,
                inputData: inputData,
                inputs: inputs,
                setValues: setValues,
                getValues: getValues
            }

            return form;
        }

        const createTextInput = function (model, field) {
            let divE = $('<div>').addClass('mdl-textfield mdl-js-textfield mdl-textfield--floating-label').mdl();
            let id = `cms-form-${model.collection}-${field.name}`;
            let inputE = $('<input type="text">')
                .attr('id', id)
                .addClass('mdl-textfield__input')
                .appendTo(divE);
            if (field.type === 'secret') {
                inputE.attr('type', 'password');
            }
            let labelE = $('<label>')
                .attr('for', id)
                .addClass('mdl-textfield__label')
                .text(field.name)
                .appendTo(divE);

            const getValue = function () {
                let inputValue = inputE.val();
                if (inputValue) {
                    return inputE.val();
                } else {
                    return null;
                }
            }
            const setValue = function (value) {
                inputE.val(value);
            }

            return {
                divE: divE,
                inputE: inputE,
                labelE: labelE,
                getValue: getValue,
                setValue: setValue
            }
        }

        const createNumberInput = function (model, field) {
            let divE = $('<div>').addClass('mdl-textfield mdl-js-textfield mdl-textfield--floating-label').mdl();
            let id = `cms-form-${model.collection}-${field.name}`;
            let inputE = $('<input type="text" pattern="-?[0-9]*(\\.[0-9]+)?">')
                .attr('id', id)
                .addClass('mdl-textfield__input')
                .appendTo(divE);
            let labelE = $('<label>')
                .attr('for', id)
                .addClass('mdl-textfield__label')
                .text(field.name)
                .appendTo(divE);
            let spanE = $('<span>')
                .addClass('mdl-textfield__error')
                .text('Input is not a number')
                .appendTo(divE);

            const getValue = function () {
                let inputValue = inputE.val();
                if (inputValue) {
                    return Number(inputE.val());
                } else {
                    return null;
                }
            }

            const setValue = function (value) {
                inputE.val(value);
            }

            return {
                divE: divE,
                inputE: inputE,
                labelE: labelE,
                getValue: getValue,
                setValue: setValue
            }
        }

        const createJsonInput = function (model, field) {
            let divE = $('<div>').addClass('mdl-textfield mdl-js-textfield').mdl();
            let id = `cms-form-${model.collection}-${field.name}`;
            let inputE = $('<textarea type="text" rows="5">')
                .attr('id', id)
                .addClass('mdl-textfield__input')
                .appendTo(divE);
            let labelE = $('<label>')
                .attr('for', id)
                .addClass('mdl-textfield__label')
                .text(field.name)
                .appendTo(divE);

            const getValue = function () {
                let inputValue = inputE.val();
                if (inputValue) {
                    try {
                        return JSON.parse(inputValue);
                    } catch (e) {
                        $.cms.log.error('cannot parse JSON : ' + e);
                        throw e;
                    }
                } else {
                    return null;
                }
            }

            const setValue = function (value) {
                inputE.val(JSON.stringify(value, null, 2));
            }

            return {
                divE: divE,
                inputE: inputE,
                labelE: labelE,
                getValue: getValue,
                setValue: setValue
            }
        }

        const createSwitchInput = function (model, field) {
            let id = `cms-form-${model.collection}-${field.name}`;
            let labelE = $('<label>')
                .attr('for', id)
                .addClass('mdl-switch mdl-js-switch mdl-js-ripple-effect')
                .mdl();
            let inputE = $('<input type="checkbox">')
                .attr('id', id)
                .addClass('mdl-switch__input')
                .appendTo(labelE);
            let spanE = $('<div>').addClass('mdl-switch__label').text(field.name).appendTo(labelE);

            const getValue = function () {
                return labelE.hasClass('is-checked');
            }
            const setValue = function (value) {
                if (value) {
                    window.setTimeout(function () {
                        labelE.addClass('is-checked');
                    }, 0);
                } else {
                    labelE.removeClass('is-checked')
                }
            }

            return {
                divE: labelE,
                inputE: inputE,
                labelE: labelE,
                getValue: getValue,
                setValue: setValue
            }
        }

        return {
            create: create
        }
    }

    !$.cms ? $.cms = {} : null;

    jQuery.extend($.cms, {
        form: Constructor()
    });
})();
