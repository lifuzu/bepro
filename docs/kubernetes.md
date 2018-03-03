
### Install minikube
```
curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-darwin-amd64 && \
  chmod +x minikube && \
  sudo mv minikube /usr/local/bin/
```

### Use Hyperkit VM driver
```
curl -LO https://storage.googleapis.com/minikube/releases/latest/docker-machine-driver-hyperkit \
&& chmod +x docker-machine-driver-hyperkit \
&& sudo mv docker-machine-driver-hyperkit /usr/local/bin/ \
&& sudo chown root:wheel /usr/local/bin/docker-machine-driver-hyperkit \
&& sudo chmod u+s /usr/local/bin/docker-machine-driver-hyperkit
```

### Start minikube
```
$ minikube start --vm-driver=hyperkit

# NOTE: clean up the previous
$ minikube [ stop | delete ]
```

### Create a Deployment that manages a Pod
```
$ kubectl run jenkins --image=jenkins/jenkins:lts --port=8080

# View the Deployment:
$ kubectl get deployments

# View the Pod:
$ kubectl get pods

# View cluster events:
$ kubectl get events

# View the kubectl configuration:
$ kubectl config view
```

### Create a Service
```
$ kubectl expose deployment jenkins --type=LoadBalancer

# View the Service you just created:
$ kubectl get services
```

### Update the image of your Deployment:
```
$ kubectl set image deployment/jenkins jenkins=jenkins/jenkins:lts
```


### References:
1. https://kubernetes.io/docs/tutorials/stateless-application/hello-minikube/