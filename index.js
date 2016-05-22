'use strict';

import _ from 'lodash';

const STATUSES = {
    PENDING: 'pending',
    STARTED: 'started',
    COMPLETE: 'complete'
};

export class ProcessStep {

    constructor(id, title) {
        this.id = id;
        this.title = title;
        this.isStarted = false;
        this.isComplete = false;
        this.data = {};
    }

    started() {
        this.isStarted = true;
    };

    complete() {
        this.isStarted = true;
        this.isComplete = true;
    };

    notComplete() {
        this.isComplete = false;
    };

    statusString() {
        if (this.isComplete) {
            return STATUSES.COMPLETE;
        } else if (this.isStarted) {
            return STATUSES.STARTED;
        } else {
            return STATUSES.PENDING;
        }
    };

    static factory() {
        return {
            create: function (id, title) {
                return new ProcessStep(id, title);
            }
        }
    }
}

ProcessStep.factory.$inject = [];

export class Process {

    constructor(id, title, ordered) {
        this.id = id;
        this.title = title;
        this.ordered = ordered;
        this.steps = [];
        this.currentStep = null;
    }

    addStep(processStep, pos, active) {
        if (this.steps.indexOf(processStep) === -1) {
            if (pos > -1 && pos < this.steps.length) {
                this.steps.splice(pos, 0, processStep);
            } else {
                this.steps.push(processStep);
            }
        }
        if (active || this.steps.length === 1) {
            this.currentStep = processStep;
        }
        return processStep;
    }

    getStep(id) {
        return this.steps.filter(function (step) {
            return step.id === id;
        }).shift();
    }

    stepsComplete() {
        return this.steps.filter(function (step) {
            return step.isComplete;
        }).length;
    }

    allStepsComplete() {
        return this.stepsComplete() === this.totalSteps();
    }

    areTheseStepsComplete(ids) {
        if (ids && _.isArray(ids) && ids.length) {
            var completedStepIds = this.steps.filter(function (step) {
                return step.isComplete;
            }).map(function (step) {
                return step.id;
            });
            if (!completedStepIds.length) {
                return false;
            }
            return _.every(ids, function (id) {
                return completedStepIds.indexOf(id) > -1;
            });
        } else {
            return false;
        }
    }

    percentComplete() {
        return Math.round(this.stepsComplete() / this.totalSteps() * 100) + '%';
    }

    stepsRemaining() {
        return this.steps.filter(function (step) {
            return !step.isComplete;
        }).length;
    }

    totalSteps() {
        return this.steps.length;
    }

    stringify(wrapper, merge) {
        return JSON.stringify(this.toObject(wrapper, merge));
    };

    toObject(wrapper, merge) {
        var obj = wrapper || {};
        _.forEach(this.steps, function (step) {
            if (merge) {
                obj = _.defaultsDeep(obj, step.data);
            } else {
                obj[step.id] = step.data;
            }
        });
        return obj;
    };

    static factory() {
        return {
            create: function (id, title, ordered) {
                return new Process(id, title, ordered);
            }
        }
    }
}

Process.factory.$inject = [];