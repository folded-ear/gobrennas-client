import TaskStore from "./TaskStore";

function PlanStore() {
    this.getPlans = this.getLists;
    this.getActivePlanLO = this.getActiveListLO;
    return this;
}

PlanStore.prototype = TaskStore;

export default new PlanStore();
